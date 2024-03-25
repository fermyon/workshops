# Getting started with Spin

This document assumes you have followed [the setup guide](./00-setup.md) and have an environment configured with the Spin CLI and other language-specific tools (such as `node`, or `cargo`).

```bash
$ spin --version
spin 2.3.0 (ee6706c8 2024-02-29)
```

[Spin](https://github.com/fermyon/spin) is an open source framework for building, distributing, and running serverless applications and microservices with WebAssembly (or Wasm).

Spin uses Wasm because of its portability, sandboxed execution environment, and near-native speed. [More and more languages have support for WebAssembly](https://www.fermyon.com/wasm-languages/webassembly-language-support), so you should be able to use your favorite language to build your first serverless application with Wasm.

The following two sections will guide you through creating your first Spin applications. Before getting started, make sure you have configured the correct Spin templates. Here are a few of the templates we will use:

```bash
$ spin templates list

+-----------------------------------------------------------------------------+
| Name                Description                                             |
+=============================================================================+
| http-empty          HTTP application with no components                     |
| http-js             HTTP request handler using Javascript                   |
| http-rust           HTTP request handler using Rust                         |
| http-ts             HTTP request handler using Typescript                   |
| kv-explorer         Explore the contents of Spin KV stores                  |
| nextjs-frontend     Build your front-end application using Next.js and Spin |
| static-fileserver   Serves static files from an asset directory             |
+-----------------------------------------------------------------------------+
```

You are now ready to create your first Spin applications. Depending on what language you are familiar with, you can choose to follow the rest of the guide in Rust or JavaScript/TypeScript.

## a. Building your first Spin application with Rust

Rust has excellent [support for WebAssembly](https://www.rust-lang.org/what/wasm), and Spin has an SDK for Rust that simplifies building Spin applications in Rust.

> Note: find more about [building Spin applications in Rust from the Spin documentation](https://developer.fermyon.com/spin/rust-components).

You can create a new Spin application in Rust based on a template — in this case, based on the HTTP Rust template for Spin. This will create all the required configuration and files for your application — in this case, a regular Rust library project, with an additional configuration file, `spin.toml`:

```bash
$ spin new hello-rust -t http-rust --accept-defaults && cd hello-rust
$ tree
|-- Cargo.toml
|-- spin.toml
 -- src
     -- lib.rs
```

> You can `sudo apt-get install tree` if you do not have `tree` installed.

Let's explore the `spin.toml` file. This is the Spin manifest file, which tells Spin what events should trigger what components. In our case we have a HTTP trigger at the route `/...` — a wildcard that matches any request sent to this application. The trigger sends requests to our component `hello-rust`. In more complex applications, you can define multiple components that are triggered for requests on different routes.

```toml
spin_manifest_version = 2

[application]
name = "hello-rust"
version = "0.1.0"
authors = ["Fermyon Engineering <engineering@fermyon.com>"]
description = "Hello World Rust Application"

[[trigger.http]]
route = "/..."
component = "hello-rust"

[component.hello-rust]
source = "target/wasm32-wasi/release/hello_rust.wasm"
allowed_outbound_hosts = []
[component.hello-rust.build]
command = "cargo build --target wasm32-wasi --release"
watch = ["src/**/*.rs", "Cargo.toml"]
```

> Note: you can [learn more about the Spin manifest file and components in the Spin documentation](https://developer.fermyon.com/spin/writing-apps).

You are now ready to build your application using `spin build`, which will invoke each component's `[component.build.command]` from `spin.toml`:

```bash
spin build
```

> Note: if you are having issues building your application, refer to the [troubleshooting guide from the setup document](./00-setup.md#troubleshooting).

You can now start your application using `spin up`:

```bash
$ spin up
Logging component stdio to ".spin/logs/"

Serving http://127.0.0.1:3000
Available Routes:
  hello-rust: http://127.0.0.1:3000 (wildcard)
```

The command will start Spin on port 3000. You can now access the application by navigating to [http://localhost:3000](http://localhost:3000) in your browser, or by using `curl`:

```bash
$ curl localhost:3000
Hello, Fermyon
```

That response is coming from the handler function for this component — in the case of a Rust component, defined in `src/lib.rs`. Our entire application consists of a single Rust function, `handle_hello_rust`, which takes the HTTP request as an argument and returns an HTTP response.

Let's change the message body to "Hello, WebAssembly!":

```rust
/// A simple Spin HTTP component.
#[http_component]
fn handle_hello_rust(req: Request) -> anyhow::Result<impl IntoResponse> {
    println!("Handling request to {:?}", req.header("spin-full-url"));
    Ok(Response::builder()
        .status(200)
        .header("content-type", "text/plain")
        .body("Hello, WebAssembly!")
        .build())
}
```

We can now run `spin build` again, which will compile our component, and we can use the `--up` flag to automatically start the application, then send another request:

```bash
$ spin build --up
$ curl -v localhost:3000
< HTTP/1.1 200 OK
< content-type: text/plain

Hello, WebAssembly!
```

You are now ready to expand your application. You can follow the [guide for building Rust components from the Spin documentation](https://developer.fermyon.com/spin/rust-components).

> Note: you can find the complete applications used in this workshop in the [`apps` directory](./apps/).

## b. Building your first Spin application with JavaScript or TypeScript

JavaScript is one of the most popular programming languages. Spin has an [experimental SDK and toolchain](https://github.com/fermyon/spin-js-sdk) for JavaScript and TypeScript which is based on [QuickJS](https://bellard.org/quickjs/), a small embeddable JavaScript runtime.

> Note: you can [read more about how the Spin SDK for JavaScript and TypeScript is built on Fermyon's blog](https://www.fermyon.com/blog/spin-js-sdk).

Let's create a new Spin application in TypeScript, based on the HTTP template. This will create all the required configuration and files for the application:

```bash
$ spin new hello-typescript -t http-ts --accept-defaults && cd hello-typescript
$ tree
|-- README.md
|-- package.json
|-- spin.toml
|-- src
|    -- index.ts
|-- tsconfig.json
|-- webpack.config.js
```

> You can `sudo apt-get install tree` if you do not have `tree` installed.

Let's explore the `spin.toml` file. This is the Spin manifest file, which tells Spin what events should trigger what components. In our case we have a HTTP trigger at the route `/...` — a wildcard that matches any request sent to this application. The trigger sends requests to our component `hello-rust`. In more complex applications, you can define multiple components that are triggered for requests on different routes.

```toml
[application]
name = "hello-typescript"
version = "0.1.0"
authors = ["Fermyon Engineering <engineering@fermyon.com>"]
description = "Hello World Rust Application"

[[trigger.http]]
route = "/..."
component = "hello-typescript"

[component.hello-typescript]
source = "target/hello-typescript.wasm"
exclude_files = ["**/node_modules"]
[component.hello-typescript.build]
command = "npm run build"
watch = ["src/**/*.ts", "package.json"]
```

> Note: you can [learn more about the Spin manifest file and components in the Spin documentation](https://developer.fermyon.com/spin/writing-apps).

First install the dependencies for the template with npm:

```bash
npm install
```

You are now ready to build your application using `spin build`, which will invoke each component's `[component.build.command]` from `spin.toml`:

```bash
$ spin build
Building component hello-typescript with `npm run build`
...
Spin compatible module built successfully
Finished building all Spin components
```

> Note: if you are having issues building your application, refer to the [troubleshooting guide from the setup document](./00-setup.md#troubleshooting).

You can now start your application using `spin up`:

```bash
$ spin up
Logging component stdio to ".spin/logs/"

Serving http://127.0.0.1:3000
Available Routes:
  hello-typescript: http://127.0.0.1:3000 (wildcard)
```

The command will start Spin on port 3000. You can now access the application by navigating to [http://localhost:3000](http://localhost:3000) in your browser, or by using `curl`:

```bash
$ curl localhost:3000
Hello from TS-SDK
```

That response is coming from the handler function for this component — in the case of a TypeScript component, defined in the index file from `src/index.ts`. Our entire application consists of a single function, `handleRequest`, which takes the HTTP request as an argument and returns an HTTP response.

Let's change the message body to "Hello, WebAssembly!":

```typescript
export const handleRequest: HandleRequest = async function (
  request: HttpRequest
): Promise<HttpResponse> {
  return {
    status: 200,
    headers: { "content-type": "text/plain" },
    body: "Hello, WebAssembly!",
  };
};
```

We can now run `spin build` again, which will compile our component, and we can use the `--up` flag to automatically start the application, then send another request:

```bash
$ spin build --up
$ curl -v localhost:3000
< HTTP/1.1 200 OK
< content-type: text/plain

Hello, WebAssembly!
```

You are now ready to expand your application. You can follow the [guide for building JavaScript components from the Spin documentation](https://developer.fermyon.com/spin/javascript-components).

> Note: you can find the complete applications used in this workshop in the [`apps` directory](./apps/).

## c. Building your first Spin application with Python

With Python being a very popular language, Spin provides support for building components with Python; using an experimental SDK. The development of the Python SDK is continually being worked on to improve user experience and also add new features.

You can create a new Spin application in Python based on a template — in this case, based on the HTTP Python template for Spin. This will create all the required configuration and files for your application — in this case, a regular Python library project, with an additional configuration file, `spin.toml`:

```bash
$ spin new hello-python -t http-py --accept-defaults && cd hello-python
$ tree
.
├── app.py
├── spin.toml
└── requirements.txt 
```

Let's explore the `spin.toml` file. This is the Spin manifest file, which tells Spin what events should trigger what components. In our case we have a HTTP trigger at the route `/...` — a wildcard that matches any request sent to this application. The trigger sends requests to our component `hello-python`. In more complex applications, you can define multiple components that are triggered for requests on different routes.

<!-- @nocpy -->

```toml
spin_manifest_version = 2

[application]
name = "hello_python"
version = "0.1.0"
authors = ["Your Name <your-name@example.com>"]
description = "My first Python Spin application"

[[trigger.http]]
route = "/..."
component = "hello-python"

[component.hello-python]
source = "app.wasm"
[component.hello-python.build]
command = "componentize-py -w spin-http componentize app -o app.wasm"
watch = ["*.py", "requirements.txt"]
```

> Note: you can [learn more about the Spin manifest file and components in the Spin documentation](https://developer.fermyon.com/spin/writing-apps).


You are now ready to build your application using `spin build`, which will invoke each component's `[component.build.command]` from `spin.toml` but before that as a standard practice for Python, create and activate a virtual env:


If you are on a Mac/linux based operating system use the following commands:

```bash
$ python3 -m venv venv
$ source venv/bin/activate
```

If you are using Windows, use the following commands:

```bash
C:\Work> python3 -m venv venv
C:\Work> venv\Scripts\activate
```

Install `componentize-py` and `spin-sdk` packages

<!-- @selectiveCpy -->

```bash
$ pip3 install -r requirements.txt
```

Then run:

<!-- @selectiveCpy -->

```bash
$ spin build
Executing the build command for component hello-python: "componentize-py -w spin-http componentize app -o app.wasm"
Finished building all Spin components
```


Now that you have created the application and built the component, you can _spin up_
the application:

<!-- @selectiveCpy -->

```bash
$ spin up
Serving http://127.0.0.1:3000
Available Routes:
  hello-python: http://127.0.0.1:3000 (wildcard)
```
The command will start Spin on port 3000. You can now access the application by navigating to [http://localhost:3000](http://localhost:3000) in your browser, or by using `curl`:

<!-- @selectiveCpy -->

```bash
$ curl -i localhost:3000
HTTP/1.1 200 OK
content-type: text/plain
content-length: 14
date = "2023-11-04T00:00:01Z"

Hello from Python
```

That response is coming from the handler function for this component — in the case of a Python component, defined in the index file from `src/app.py`. Our entire application consists of a single function, `handleRequest`, which takes the HTTP request as an argument and returns an HTTP response.

Let's change the message body to "Hello, WebAssembly!":

```
from spin_sdk.http import IncomingHandler, Request, Response

class IncomingHandler(IncomingHandler):
    def handle_request(self, request: Request) -> Response:
        return Response(
            200,
            {"content-type": "text/plain"},
            bytes("Hello, WebAssembly", "utf-8")
        )
```

We can now run `spin build` again, which will compile our component, and we can use the `--up` flag to automatically start the application, then send another request:

```bash
$ spin build --up
$ curl -v localhost:3000
< HTTP/1.1 200 OK
< content-type: text/plain

Hello, WebAssembly!
```

You are now ready to expand your application. You can follow the [guide for building Python components from the Spin documentation](https://developer.fermyon.com/spin/v2/python-components).

> Note: you can find the complete applications used in this workshop in the [`apps` directory](./apps/).

## Learning Summary

In this section you learned how to:

- [x] Check your Spin CLI version
- [x] Create a new Spin app using a template
- [x] Build your Spin application with `spin build`
- [x] Run your application locally with `spin up`
- [x] Modify an HTTP trigger's route and entrypoint

## Navigation

- Go back to [00 - Setup](00-setup.md) if you still have questions on previous section
- Otherwise, proceed to [02 - Building a Magic 8 Ball JSON API with Spin](02-json-api.md)
