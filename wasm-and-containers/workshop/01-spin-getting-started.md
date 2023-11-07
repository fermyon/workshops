# Getting started with Spin and WebAssembly

- [Getting started with Spin and WebAssembly](#getting-started-with-spin-and-webassembly)
  - [1. Spin New - Create a Spin application and choose a template](#1-spin-new---create-a-spin-application-and-choose-a-template)
    - [A few words about choosing a programming language](#a-few-words-about-choosing-a-programming-language)
  - [2. Spin Build and Spin Up - Build and run the application](#2-spin-build-and-spin-up---build-and-run-the-application)
  - [Deploy your Spin application](#deploy-your-spin-application)
  - [3. Fermyon Cloud - Deploy the application to Fermyon Cloud](#3-fermyon-cloud---deploy-the-application-to-fermyon-cloud)
  - [Quick Reference for this Section](#quick-reference-for-this-section)
    - [Using TypeScript](#using-typescript)
    - [Using Rust](#using-rust)
    - [Using Go](#using-go)
    - [Using Python](#using-python)
  - [Learning Summary](#learning-summary)
  - [Navigation](#navigation)

In this module, we'll explore how to building an application using [Spin](https://github.com/fermyon/spin), an open source developer tool for building and running serverless applications with WebAssembly.

Spin uses Wasm because of its portability, sandbox'ed execution environment, and near-native speed. [More and more languages have support for WebAssembly](https://www.fermyon.com/wasm-languages/webassembly-language-support), so you should be able to use your favorite language to build your first serverless application with Wasm. In this workshop, we've provided sample code for Rust, TypeScript, Go, and Python.

> **Note**
> This document assumes you have followed [the setup steps](./00-setup.md) and have an environment configured with all the prerequisites.

> **Note**
> The section [Quick Reference for this Section](#quick-reference-for-this-section), at the end of this page, contains all the commands and code needed to complete this module, for a quick reference.

## 1. Spin New - Create a Spin application and choose a template

`spin new` is the command you'll use to initialize a new Spin application. A Spin application consists of multiple components, which will be triggered independently.

When you run `spin new`, you are provided with a list of available templates for a Spin component. Please pick any template, which starts with `v1-http-` from the list.

> **Note**
> If choosing any other template, it is not guaranteed that all modules of this workshop can be completed successfully. 

E.g:
```bash
$ spin new
Pick a template to start your application with:
> v1-http-go (v1 Manifest - HTTP request handler using (Tiny)Go)
  v1-http-js (v1 Manifest - HTTP request handler using Javascript)
  v1-http-py (v1 Manifest - HTTP request handler using Python)
  v1-http-rust (v1 Manifest - HTTP request handler using Rust)
  v1-http-ts (v1 Manifest - HTTP request handler using Typescript)
...
```

You can also provide the `--template <template-name>` parameter to the `spin new` command, to choose a template.

E.g. For using TypeScript:
```bash
$ spin new --template v1-http-ts
Enter a name for your new application: my-application
Description:
HTTP path: /...
```

Once the application is created, a sub-directory is created with the name corresponding to the application name you provided. Depending on the programming language you choose for your template, the directory layout may differ.

E.g. having used the `v1-http-ts` template:
```bash
$ cd my-application
$ tree
|-- README.md
|-- package.json
|-- spin.toml         <-- Spin manifest
|-- src
|    -- index.ts      <-- Source file for the first component
|-- tsconfig.json
|-- webpack.config.js
```

Let's explore the `spin.toml` file. This is the Spin manifest file, which tells Spin what events should trigger what components. In this case our trigger is HTTP, for a web application, and we have only one component, at the route `/...` — a wildcard that matches any request sent to this application. Spin applications can consists of many component, where you can define which components that are triggered for requests on different routes.

```toml
spin_manifest_version = "1"
authors = "Fermyon Engineering"
description = ""
name = "my-application"
# This is an HTTP application.
trigger = { type = "http", base = "/" }
version = "0.1.0"

[[component]]
id = "my-application"
# The Wasm module to execute for this component.
source = "target/my_application.wasm"
# This components capability to create HTTP requests.
allowed_http_hosts = []
# Excluding files from being added to the WASM module being built
exclude_files = ["**/node_modules"]
[component.trigger]
# This component will get invoked for all requests to `/...`.
route = "/..."
[component.build]
# The command to execute when running `spin build`.
command = "npm run build"
```

> **Note**
> You can [learn more about the Spin manifest file in the Spin documentation](https://developer.fermyon.com/spin/writing-apps).

### A few words about choosing a programming language

For this workshop, it doesn't matter what language you choose, as we've provided all the source code needed to complete the workshop. However, for any project you would like to endeavour on yourself, it's important to know the state of support for a giving programming language in the context ow WebAssembly, and more specifically [WASI](https://wasi.dev/).

You can find a good overview of the support on the [WebAssembly language support matrix](https://www.fermyon.com/wasm-languages/webassembly-language-support/).
The Spin documentation also provides guides for the most popular languages, which you can find here: [Spin Language Guides](https://developer.fermyon.com/spin/v2/language-support-overview).

## 2. Spin Build and Spin Up - Build and run the application

You are now ready to build your application using `spin build`, which will invoke each component's `[component.build.command]` from `spin.toml`:

E.g.: 
```bash
# For TypeScript applications, you need to install dependencies once
$ npm install
# Building the application
$ spin build
Building component my-application with `npm run build`
...
Finished building all Spin components
```

> **Note**
> If you are having issues building your application, refer to the [troubleshooting guide from the setup document](./00-setup.md#troubleshooting).

You can now start your application using `spin up`:

```bash
$ spin up
Serving http://127.0.0.1:3000
Available Routes:
  hello-rust: http://127.0.0.1:3000 (wildcard)
```

The command will start Spin on port 3000 (use `--listen <ADDRESS>` to change the address and port - e.g., `--listen 0.0.0.0:3030`). You can now access the application by navigating to `localhost:3000` in your browser, or by using `curl`:

```bash
$ curl localhost:3000
Hello, Fermyon
```

That response is coming from the handler function for this component. The application consists of a single function, which  (for TypeScript) takes the HTTP request (`HTTPRequest`) as an argument and returns a Promise with an HTTP response (`Promise<HttpResponse>`).

Typescript example
```typescript
import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk"

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
  return {
    status: 200,
    headers: { "content-type": "text/plain" },
    body: "Hello, Fermyon"
  }
}
```

We can try changing the message body returned to `Hello, KubeCon`. We can now run `spin build` again, which will compile our component, and we can use the `--up` flag to automatically start the application, then send another request:

```bash
$ spin build --up
$ curl localhost:3000
Hello, KubeCon
```

> **Note**
> Spin also has a [`spin watch`](https://developer.fermyon.com/spin/v2/running-apps#monitoring-applications-for-changes) command to automatically rebuild the application on file changes.

## Deploy your Spin application

Spin applications can run in many places.  You can run them: 

* anywhere you can run the Spin CLI
* anywhere you can run a Docker container using containerd (see the next section)
* [Fermyon Cloud](https://www.fermyon.com/cloud)
* [Wasmtime 14](https://wasmtime.dev/)
* [NGINX Unit](https://unit.nginx.org/)
* [wasmCloud](https://wasmcloud.com/)
* [Cosmonic](https://cosmonic.com/)

* and probably a few other place we've forgot to mention here...

We'll explore some of these options in later modules of the workshop.

> **Note**
> Depending on the deployment target, there might be additional steps required to package the application. Some targets also only support running a single component.

## 3. Fermyon Cloud - Deploy the application to Fermyon Cloud

You can try deploying the application to Fermyon Cloud, which provides a free plan for Spin application hosting. You will be able to deploy to Fermyon Cloud, using the [Fermyon Cloud plugin for Spin](https://github.com/fermyon/cloud-plugin).

First, login to Fermyon Cloud with your GitHub ID:

```bash
$ spin cloud login
```
And follow the steps to authorize the device.  Then you can deploy your application:

```bash
$ spin cloud deploy
```

TODO - Add Using KeyValue and FileServer. Use the Redis API, as this can work with containers...

## Quick Reference for this Section

The below sections contains a quick reference, with all the commands and the code needed for each language to complete this section.

### Using TypeScript

```bash
$ spin new -t v1-http-ts my-application --accept-defaults
$ cd my-application
$ npm install
$ spin build --up
```

```typescript
// Content of src/index.ts
import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk"

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
  return {
    status: 200,
    headers: { "content-type": "text/plain" },
    body: "Hello, Kubecon!"
  }
}
```

### Using Rust

```bash
$ spin new -t v1-http-rust my-application --accept-defaults
$ cd my-application
$ spin build --up
```

```rust
// Content of src/lib.rs
use anyhow::Result;
use spin_sdk::{
    http::{Request, Response},
    http_component,
};

/// A simple Spin HTTP component.
#[http_component]
fn handle_my_application(req: Request) -> Result<Response> {
    println!("{:?}", req.headers());
    Ok(http::Response::builder()
        .status(200)
        .header("foo", "bar")
        .body(Some("Hello, KubeCon!".into()))?)
}
```

### Using Go

```bash
$ spin new -t v1-http-go my-application --accept-defaults
$ cd my-application
$ spin build --up
```

```golang
// Content of main.go
package main

import (
	"fmt"
	"net/http"

	spinhttp "github.com/fermyon/spin/sdk/go/http"
)

func init() {
	spinhttp.Handle(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		fmt.Fprintln(w, "Hello KubeCon!")
	})
}

func main() {}
```

### Using Python

```bash
$ spin new -t v1-http-py my-application --accept-defaults
$ cd my-application
$ spin build --up
```

```python
# Content of app.py
from spin_http import Response

def handle_request(request):

    return Response(200,
                    {"content-type": "text/plain"},
                    bytes(f"Hello KubeCon!", "utf-8"))
```

## Learning Summary

In this section you learned how to:

- Create a new Spin app using a template
- Build your Spin application with `spin build`
- Run your application locally with `spin up`

## Navigation

- Go back to [0. Setup](00-setup.md) if you still have questions on previous section
- Otherwise, proceed to [2. Run your first WebAssembly application in a container](02-running-in-a-container.md) if you still have questions on previous section.
