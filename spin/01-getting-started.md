# Getting started with Spin

This document assumes you have followed [the setup guide](./00-setup.md) and have an environment configured with the Spin CLI and other language-specific tools (such as `node`, `cargo`, or `tinygo`).

```bash
$ spin --version
spin 1.4.0
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

### a. Building your first Spin application with Rust

Rust has excellent [support for WebAssembly](https://www.rust-lang.org/what/wasm), and Spin has an SDK for Rust that simplifies building Spin applications in Rust.

> Note: find more about [building Spin applications in Rust from the Spin documentation](https://developer.fermyon.com/spin/rust-components).

You can create a new Spin application in Rust based on a template — in this case, based on the HTTP Rust template for Spin. This will create all the required configuration and files for your application — in this case, a regular Rust library project, with an additional configuration file, `spin.toml`:

```bash
$ spin new http-rust hello-rust --accept-defaults && cd hello-rust
$ tree
|-- Cargo.toml
|-- spin.toml
 -- src
     -- lib.rs
```

> You can `sudo apt-get install tree` if you do not have `tree` installed.

Let's explore the `spin.toml` file. This is the Spin manifest file, which tells Spin what events should trigger what components. In this case our trigger is HTTP, for a web application, and we have only one component, at the route `/...` — a wildcard that matches any request sent to this application. In more complex applications, you can define multiple components that are triggered for requests on different routes.

```toml
spin_manifest_version = "1"
name = "hello-rust"
# This is an HTTP application.
trigger = { type = "http", base = "/" }
version = "0.1.0"

[[component]]
id = "hello-rust"
# The Wasm module to execute for this component.
source = "target/wasm32-wasi/release/hello_rust.wasm"
# This component is not allowed to make any outbound HTTP requests.
allowed_http_hosts = []
[component.trigger]
# This component will get invoked for all requests to `/...`.
route = "/..."
[component.build]
# The command to execute when running `spin build`.
command = "cargo build --target wasm32-wasi --release"
```

> Note: you can [learn more about the Spin manifest file and components in the Spin documentation](https://developer.fermyon.com/spin/writing-apps).

You are now ready to build your application using `spin build`, which will invoke each component's `[component.build.command]` from `spin.toml`:

```bash
$ spin build
Executing the build command for component hello-rust: cargo build --target wasm32-wasi --release
...
Successfully ran the build command for the Spin components.
```

> Note: if you are having issues building your application, refer to the [troubleshooting guide from the setup document](./00-setup.md#troubleshooting).

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

That response is coming from the handler function for this component — in the case of a Rust component, defined in `src/lib.rs`. Our entire application consists of a single Rust function, `handle_hello_rust`, which takes the HTTP request as an argument and returns an HTTP response.

Let's change the message body to "Hello, WebAssembly!":

```rust
// The entrypoint to our component.
#[http_component]
fn handle_hello_rust(req: Request) -> Result<Response> {
    println!("{:?}", req.headers());
    Ok(http::Response::builder()
        .status(200)
        .header("foo", "bar")
        // Change this message from "Hello, Fermyon" to "Hello, WebAssembly!".
        .body(Some("Hello, WebAssembly!".into()))?)
}
```

We can now run `spin build` again, which will compile our component, and we can use the `--up` flag to automatically start the application, then send another request:

```bash
$ spin build --up
$ curl -v localhost:3000
< HTTP/1.1 200 OK
< foo: bar
< content-length: 19

Hello, WebAssembly!
```

You are now ready to expand your application. You can follow the [guide for building Rust components from the Spin documentation](https://developer.fermyon.com/spin/rust-components).

> Note: you can find the complete applications used in this workshop in the [`apps` directory](./apps/).

### b. Building your first Spin application with JavaScript or TypeScript

JavaScript is one of the most popular programming languages. Spin has an [experimental SDK and toolchain](https://github.com/fermyon/spin-js-sdk) for JavaScript and TypeScript which is based on [QuickJS](https://bellard.org/quickjs/), a small embeddable JavaScript runtime.

> Note: you can [read more about how the Spin SDK for JavaScript and TypeScript is built on Fermyon's blog](https://www.fermyon.com/blog/spin-js-sdk).

Let's create a new Spin application in TypeScript, based on the HTTP template. This will create all the required configuration and files for the application:

```bash
$ spin new http-ts hello-typescript --accept-defaults && cd hello-typescript
$ tree
|-- README.md
|-- package.json
|-- spin.toml
|-- src
|    -- index.ts
|-- tsconfig.json
|-- webpack.config.js
```


Let's explore the `spin.toml` file. This is the Spin manifest file, which tells Spin what events should trigger what components. In this case our trigger is HTTP, for a web application, and we have only one component, at the route `/...` — a wildcard that matches any request sent to this application. In more complex applications, you can define multiple components that are triggered for requests on different routes.

```toml
spin_manifest_version = "1"
name = "hello-typescript"
# This is an HTTP application.
trigger = { type = "http", base = "/" }
version = "0.1.0"

[[component]]
id = "hello-typescript"
# The Wasm module to execute for this component.
source = "target/spin-http-js.wasm"
exclude_files = ["**/node_modules"]
[component.trigger]
# This component will get invoked for all requests to `/...`.
route = "/..."
[component.build]
# The command to execute when running `spin build`.
command = "npm run build"
```

> Note: you can [learn more about the Spin manifest file and components in the Spin documentation](https://developer.fermyon.com/spin/writing-apps).

First install the dependencies for the template with `npm install`. You are now ready to build your application using `spin build`, which will invoke each component's `[component.build.command]` from `spin.toml`:

```bash
spin build
Executing the build command for component hello-typescript: npm run build
...
Spin compatible module built successfully
Successfully ran the build command for the Spin components.
```

> Note: if you are having issues building your application, refer to the [troubleshooting guide from the setup document](./00-setup.md#troubleshooting).

You can now start your application using `spin up`:

```bash
$ spin up
Serving http://127.0.0.1:3000
Available Routes:
  hello-typescript: http://127.0.0.1:3000 (wildcard)
```

The command will start Spin on port 3000. You can now access the application by navigating to `localhost:3000` in your browser, or by using `curl`:

```bash
$ curl localhost:3000
Hello from TS-SDK 
```

That response is coming from the handler function for this component — in the case of a TypeScript component, defined in the index file from `src/index.ts`. Our entire application consists of a single function, `handleRequest`, which takes the HTTP request as an argument and returns an HTTP response.

Let's change the message body to "Hello, WebAssembly!":


```typescript
export async function handleRequest(request: HttpRequest): Promise<HttpResponse> {
  return {
    status: 200,
    headers: { "foo": "bar" },
    body: "Hello, WebAssembly!"
  }
}
```

We can now run `spin build` again, which will compile our component, and we can use the `--up` flag to automatically start the application, then send another request:

```bash
$ spin build --up
$ curl -v localhost:3000
< HTTP/1.1 200 OK
< foo: bar
< content-length: 19

Hello, WebAssembly!
```

You are now ready to expand your application. You can follow the [guide for building JavaScript components from the Spin documentation](https://developer.fermyon.com/spin/javascript-components).

> Note: you can find the complete applications used in this workshop in the [`apps` directory](./apps/).

### Learning Summary

In this section you learned how to:

- [x] Check your Spin CLI version
- [x] Create a new Spin app using a template
- [x] Build your Spin application with `spin build`
- [x] Run your application locally with `spin up`
- [x] Modify an HTTP trigger's rouute and entrypoint

### Navigation

- Go back to [00 - Setup](00-setup.md) if you still have questions on previous section
- Otherwise, proceed to [02 - Building a Magic 8 Ball JSON API with Spin](02-json-api.md)
