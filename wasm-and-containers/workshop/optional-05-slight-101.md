# Slight 101

[Slight](https://github.com/deislabs/spiderlightning) is an experimental runtime implementation for running WebAssembly modules with `wasi-cloud-core` capabilities.

`wasi-cloud-core` is a wasm world that defines a core set of interfaces for distributed applications. It includes interfaces to interfact with key-value stores, blob storage, sql databases, message brokers and more. 

You can read more about `wasi-cloud-core` [here](https://github.com/WebAssembly/WASI/issues/520)

Here is a list of all wasi-cloud-core proposals
- [wasi-keyvalue](https://github.com/WebAssembly/wasi-keyvalue)
- [wasi-blob-store](https://github.com/WebAssembly/wasi-blob-store)
- [wasi-distributed-lock-service](https://github.com/WebAssembly/wasi-distributed-lock-service)
- [wasi-messaing](https://github.com/WebAssembly/wasi-messaging)
- [wasi-http](https://github.com/WebAssembly/wasi-http)
- [wasi-runtime-config](https://github.com/WebAssembly/wasi-runtime-config)
- [wasi-distributed-lock-service](https://github.com/WebAssembly/wasi-distributed-lock-service)
- [wasi-sql](https://github.com/WebAssembly/wasi-sql)

### Create your first slight application

To get started, we will install slight on your local machine.
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/deislabs/spiderlightning/main/install.sh)"
```

Make sure that you have the latest version of `slight` installed:

```
slight --version
slight 0.4.1
```

Next, create a new rust project with slight:

```
slight new -n spidey@v0.4.1 rust && cd spidey
```

This will create a new rust project with slight. You can find the source code for the project in the `src` directory.

### Install Rust

If you don't have Rust installed, you can install it by running the following command:

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Next, you will need to add `wasm32-wasi` target to your rust toolchain. You can do this by running the following command:

```
rustup target add wasm32-wasi
```

### Build and Run
Then you can build the project by running the following command:

```
cargo build --target wasm32-wasi
```

Finally, you can run the project by running the following command:

```
slight -c slightfile.toml run target/wasm32-wasi/debug/spidey.wasm

Hello, SpiderLightning!
```

### Try out other slight capabilities

1. [Keyvalue](https://github.com/deislabs/spiderlightning/tree/main/examples/keyvalue-demo)
2. [Messaging](https://github.com/deislabs/spiderlightning/tree/main/tests/messaging-test)
3. [Blob Store](https://github.com/deislabs/spiderlightning/tree/main/examples/blob-store-demo)
4. [HTTP Server](https://github.com/deislabs/spiderlightning/tree/main/examples/http-server-demo)