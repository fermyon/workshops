# Getting started with Spin and WebAssembly

* [Getting started with Spin and WebAssembly](#getting-started-with-spin-and-webassembly)
  * [1. Spin New - Create a Spin application and choose a template](#1-spin-new---create-a-spin-application-and-choose-a-template)
    * [A few words about choosing a programming language](#a-few-words-about-choosing-a-programming-language)
  * [2. Spin Build and Spin Up - Build and run the application](#2-spin-build-and-spin-up---build-and-run-the-application)
  * [Deploy your Spin application](#deploy-your-spin-application)
  * [3. Fermyon Cloud - Deploy the application to Fermyon Cloud](#3-fermyon-cloud---deploy-the-application-to-fermyon-cloud)
  * [Quick Reference for this Section](#quick-reference-for-this-section)
    * [Using TypeScript](#using-typescript)
    * [Using Rust](#using-rust)
    * [Using Go](#using-go)
    * [Using Python](#using-python)
  * [Do more with Spin](#do-more-with-spin)
  * [Learning Summary](#learning-summary)
  * [Navigation](#navigation)

In this module, we'll explore how to build an application using [Spin](https://github.com/fermyon/spin), an open-source developer tool for building and running serverless applications with WebAssembly (Wasm).

Spin uses Wasm because of its portability, sandboxed execution environment, and near-native speed. [More and more languages have support for WebAssembly](https://www.fermyon.com/wasm-languages/webassembly-language-support), so you should be able to use your favorite language to build your first serverless application with Wasm. In this workshop, we've provided sample code for Rust, TypeScript, Go, and Python.

> **Note**
> This document assumes you have followed [the setup steps](./00-setup.md) and have an environment configured with all the prerequisites.

> **Note**
> The section [Quick Reference for this Section](#quick-reference-for-this-section), at the end of this page, contains all the commands and code needed to complete this module, for a quick reference.

## 1. Spin New - Create a Spin application and choose a template

`spin new` is the command you'll use to initialize a new Spin application. A Spin application can consist of multiple components, which are triggered independently.

When you run `spin new`, you are provided with a list of available templates for a Spin component. Please pick any template, which starts with `http-` prefix from the list.

> **Note**
> We recommend Rust, Python, JS, or TS. If choosing any other template, it is not guaranteed that all modules of this workshop can be completed successfully. 

E.g:
```bash
$ spin new
Pick a template to start your application with:
  http-c (HTTP request handler using C and the Zig toolchain)
  http-empty (HTTP application with no components)
  http-go (HTTP request handler using (Tiny)Go)
  http-grain (HTTP request handler using Grain)
  http-js (HTTP request handler using Javascript)
> http-ts (HTTP request handler using Typescript)
...
```

You can also provide the `--template <template-name>` parameter to the `spin new` command, to choose a template.

E.g. For using TypeScript:
```bash
$ spin new my-application --template http-ts
Description: An example TypeScript app
HTTP path: /...
```

Once the application is created, a sub-directory is created with the name corresponding to the application name you provided. Depending on the programming language you choose for your template, the directory layout may differ.

E.g. having used the `http-ts` template:
```bash
$ cd my-application
$ tree
tree .
├── config
│   └── knitwit.json
├── package.json
├── spin.toml         <-- Spin manifest
├── src
│   └── index.ts      <-- Source file for the first component
├── tsconfig.json
└── webpack.config.js
```

Let's explore the `spin.toml` file. This is the Spin manifest file, which tells Spin what events should trigger what components. In this case our trigger is HTTP, for a web application, and we have only one component, at the route `/...` — a wildcard expression that matches any request sent to this application. Spin applications can consists of many components, where you can define which components that are triggered for requests on different routes.

```toml
spin_manifest_version = 2

[application]
authors = ["The Fermyon Developers"]
description = "An example TypeScript app"
name = "my-application"
version = "0.1.0"

[[trigger.http]]
route = "/..."
component = "my-application"

[component.my-application]
source = "dist/my-application.wasm"
exclude_files = ["**/node_modules"]
[component.my-application.build]
command = "npm run build"
watch = ["src/**/*.ts", "package.json"]
```

> **Note**
> You can [learn more about the Spin manifest file in the Spin documentation](https://developer.fermyon.com/spin/writing-apps).

### A few words about choosing a programming language

For this workshop, it doesn't matter what language you choose, as we've provided all the source code needed to complete the workshop. However, for any project you would like to endeavour on yourself, it's important to know the state of support for a giving programming language in the context ow WebAssembly, and more specifically [WASI](https://wasi.dev/).

You can find a good overview of the support on the [WebAssembly language support matrix](https://www.fermyon.com/wasm-languages/webassembly-language-support/).
The Spin documentation also provides guides for the most popular languages, which you can find here: [Spin Language Guides](https://developer.fermyon.com/spin/v2/language-support-overview).

## 2. Spin Build and Spin Up - Build and run the application

You are now ready to build your application using `spin build`, which will invoke each component's `[component.MYAPP.build.command]` from `spin.toml`.

E.g.:
```bash
# Building the application
$ spin build
Building component hi-civo-navigate (2 commands)
Running build step 1/2 for component my-application with 'npm install'
Running build step 2/2 for component my-application with 'npm run build'
```

> **Note**
> If you are having issues building your application, refer to the [troubleshooting guide from the setup document](./00-setup.md#troubleshooting).

You can now start your application using `spin up`:

```bash
$ spin up
Logging component stdio to ".spin/logs/"

Serving http://127.0.0.1:3000
Available Routes:
  my-application: http://127.0.0.1:3000 (wildcard)
```

The command will start Spin on port `3000` (use `--listen <ADDRESS>` to change the address and port - e.g., `--listen 0.0.0.0:3030`). You can now access the application by navigating to `localhost:3000` in your browser, or by using `curl`:

```bash
$ curl localhost:3000/         
"hello universe"

$curl localhost:3000/hello/friends
"Hello, friends!"
```

That response is coming from the handler function for this component. The application consists of a single function, which (for TypeScript) takes the HTTP request as an argument and returns the HTTP response.

Typescript example

```typescript
// For AutoRouter documentation refer to https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", () => new Response("hello universe"))
    .get('/hello/:name', ({ name }) => `Hello, ${name}!`)

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
```

We can try changing the message body returned to `Hello, Friend`. We can now run `spin build` again, which will compile our component, and we can use the `--up` flag to automatically start the application, then send another request:

```bash
$ spin build --up
$ curl localhost:3000
Hello, Friend
```

> **Note**
> Spin also has a [`spin watch`](https://developer.fermyon.com/spin/v2/running-apps#monitoring-applications-for-changes) command to automatically rebuild the application on file changes.

## Deploy your Spin application

Spin applications can run in many places. You can run them: 

* Anywhere you can run the Spin CLI
* Anywhere you can run a Docker container using containerd (see the next section)
* [Fermyon Cloud](https://www.fermyon.com/cloud)
* [Wasmtime](https://wasmtime.dev/)
* [NGINX Unit](https://unit.nginx.org/)
* [wasmCloud](https://wasmcloud.com/)

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

## Quick Reference for this Section

The below sections contains a quick reference, with all the commands and the code needed for each language to complete this section.

### Using TypeScript

```bash
$ spin new my-application -t http-ts
$ cd my-application
$ npm install
$ spin build --up
```

```typescript
// Content of src/index.ts
import { AutoRouter } from 'itty-router';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", () => new Response("hello universe"))
    .get('/hello/:name', ({ name }) => `Hello, ${name}!`)

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
```

### Using Rust

```bash
$ spin new -t http-rust my-application --accept-defaults
$ cd my-application
$ spin build --up
```

```rust
// Content of src/lib.rs
use spin_sdk::http::{IntoResponse, Request, Response};
use spin_sdk::http_component;

/// A simple Spin HTTP component.
#[http_component]
fn handle_my_application(req: Request) -> anyhow::Result<impl IntoResponse> {
    println!("Handling request to {:?}", req.header("spin-full-url"));
    Ok(Response::builder()
        .status(200)
        .header("content-type", "text/plain")
        .body("Hello, Fermyon")
        .build())
}
```

### Using Go

```bash
$ spin new -t http-go my-application --accept-defaults
$ cd my-application
$ spin build --up
```

```golang
// Content of main.go
package main

import (
	"fmt"
	"net/http"

	spinhttp "github.com/fermyon/spin/sdk/go/v2/http"
)

func init() {
	spinhttp.Handle(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		fmt.Fprintln(w, "Hello Fermyon!")
	})
}

func main() {}
```

### Using Python

```bash
$ spin new -t http-py my-application --accept-defaults
$ cd my-application
$ spin build --up
```

```python
# Content of app.py
from spin_sdk.http import IncomingHandler, Request, Response

class IncomingHandler(IncomingHandler):
    def handle_request(self, request: Request) -> Response:
        return Response(
            200,
            {"content-type": "text/plain"},
            bytes("Hello from Python!", "utf-8")
        )
```

## Do more with Spin

If you want to see more examples of what you can build with Spin, head over to the [Spin Up Hub](https://developer.fermyon.com/hub)

## Learning Summary

In this section you learned how to:

- Create a new Spin app using a template
- Build your Spin application with `spin build`
- Run your application locally with `spin up`
- Deployed your Spin application to Fermyon Cloud with `spin cloud deploy`

## Navigation

- Go back to [0. Setup](./00-setup.md) if you still have questions on previous section
- Otherwise, proceed to [2. Using Key Value stores with Spin](./02-key-value-store.md) if you still have questions on previous section.

Let us know what you think in this short [Survey](https://fibsu0jcu2g.typeform.com/workshop).
