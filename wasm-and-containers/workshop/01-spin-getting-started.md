# Getting started with Spin

- [Getting started with Spin](#getting-started-with-spin)
  - [1. Spin New - Create a Spin application and choose a template](#1-spin-new---create-a-spin-application-and-choose-a-template)
    - [A few words about choosing a programming language](#a-few-words-about-choosing-a-programming-language)
  - [2. Spin Build and Spin Up - Building and running the application](#2-spin-build-and-spin-up---building-and-running-the-application)
  - [All Commands](#all-commands)
    - [Using TypeScript](#using-typescript)
    - [Using Rust](#using-rust)
    - [Using Go](#using-go)
    - [Using Python](#using-python)
    - [Learning Summary](#learning-summary)
    - [Navigation](#navigation)

In this module, we'll explore how to building an application using [Spin](https://github.com/fermyon/spin), an open source developer tool for building and running serverless applications with WebAssembly.

Spin uses Wasm because of its portability, sandboxed execution environment, and near-native speed. [More and more languages have support for WebAssembly](https://www.fermyon.com/wasm-languages/webassembly-language-support), so you should be able to use your favorite language to build your first serverless application with Wasm.

Depending on what language you are familiar with, you can choose to follow the rest of the guide in Rust, TypeScript, Go, or Python.

> **Note**
> This document assumes you have followed [the setup steps](./00-setup.md) and have an environment configured with all the prerequisites.

> **Note**
> The section [All Command](#all-commands) contains all the commands and code needed to complete this module
TODO The above in all modules

## 1. Spin New - Create a Spin application and choose a template

`spin new` is the command we'll use to initialize a new Spin application. A Spin application consists of multiple components, which will be triggered independently.

When we run `spin new`, we are provided with a list of available templates for a Spin component. Please pick any template, which starts with `v1-http-` from the list, choosing you preferred programming language.

> **Note**
> If choosing any other template, it is not guaranteed that all modules of this workshop can be completed successfully. 

E.g:
```bach
$ spin new
Pick a template to start your application with:
> http-ts (HTTP request handler using Typescript)
  http-empty (HTTP application with no components)
  http-go (HTTP request handler using (Tiny)Go)
...
```

We can also provide the `--template <template-name>` parameter to the `spin new` command, to choose a template, and we'll have to provide a few inputs for the application and component we're creating.

E.g. For using TypeScript:
```bash
$ spin new --template v1-http-ts
Enter a name for your new application: my-application
Description:
HTTP path: /...
```

Once the application is created, all the files placed in a sub-directory with a name corresponding to the application name we provided.

Depending on the programming language you choose for your template, the directory layout may differ, but there is always a `spin.toml` file.

`spin.toml` s the application's manifest file.

E.g. having used the `v1-http-ts` template:
```bash
$ cd my-application
$ tree
|-- README.md
|-- package.json
|-- spin.toml         <-- Spin Application Manifest
|-- src
|    -- index.ts      <-- Source file
|-- tsconfig.json
|-- webpack.config.js
```

Let's explore the `spin.toml` file. This is the Spin manifest file, which tells Spin what events should trigger what components. In this case our trigger is HTTP, for a web application, and we have only one component, at the route `/...` — a wildcard that matches any request sent to this application. You can define multiple components that are triggered for requests on different routes.

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

TODO - A watch command in the manifest?

> **Note**
> You can [learn more about the Spin manifest file in the Spin documentation](https://developer.fermyon.com/spin/writing-apps).

### A few words about choosing a programming language

For this workshop, it doesn't matter what language you choose, as we've provided all the source coded needed to complete the workshop. However, for any project you would like to endeavour on yourself, it's important to know the state of support for a giving programming language in the context ow WebAssembly, and more specifically [WASI](https://wasi.dev/).

You can find a good overview of the support on the [WebAssembly language support matrix](https://www.fermyon.com/wasm-languages/webassembly-language-support/).
The Spin documentation also provides guides for the most popular languages, which you can find here: [Spin Language Guides](https://developer.fermyon.com/spin/v2/language-support-overview).

## 2. Spin Build and Spin Up - Building and running the application

We are now ready to build our application using `spin build`, which will invoke each component's `[component.build.command]` from `spin.toml`:

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

The command will start Spin on port 3000. You can now access the application by navigating to `localhost:3000` in your browser, or by using `curl`:

```bash
$ curl localhost:3000
Hello, Fermyon
```

That response is coming from the handler function for this component. Our entire application consists of a single function, which takes the HTTP request as an argument and returns an HTTP response.

We can try changing the message body returned to `Hello, KubeCon`. We can now run `spin build` again, which will compile our component, and we can use the `--up` flag to automatically start the application, then send another request:

```bash
$ spin build --up
$ curl localhost:3000
Hello, KubeCon!
```

> **Note**
> Spin also has a [`spin watch`](https://developer.fermyon.com/spin/v2/running-apps#monitoring-applications-for-changes) command to automatically rebuild the application on file changes.

You can find the complete applications used in this workshop in the [`apps` directory](./apps/).
TODO The above...

## All Commands

The below sections contains all the commands and the code needed to complete this section

### Using TypeScript

```bash
$ spin build -t v1-http-ts my-application --accept-defaults
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
$ spin build -t v1-http-rust my-application --accept-defaults
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
$ spin build -t v1-http-go my-application --accept-defaults
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
$ spin build -t v1-http-py my-application --accept-defaults
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

### Learning Summary

In this section you learned how to:

- Create a new Spin app using a template
- Build your Spin application with `spin build`
- Run your application locally with `spin up`

### Navigation
- Go back to [0. Setup](00-setup.md) if you still have questions on previous section
- Otherwise, proceed to [2. Run your first wasm app on k3d](02-run-your-first-wasm-on-k3d.md) if you still have questions on previous section.

TODO - Survey
- (_optionally_) If finished, let us know what you thought of the Spin and the workshop with this [short Typeform survey](https://fibsu0jcu2g.typeform.com/to/RK08OLSy#hubspot_utk=xxxxx&hubspot_page_name=xxxxx&hubspot_page_url=xxxxx).
