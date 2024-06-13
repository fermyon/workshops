# Setup

- [Setup](#setup)
  - [Configuring your local environment for Spin](#configuring-your-local-environment-for-spin)
    - [Using a DevContainer](#using-a-devcontainer)
  - [Troubleshooting](#troubleshooting)
    - [Q: I cannot build my Rust application with `spin build`.](#q-i-cannot-build-my-rust-application-with-spin-build)
    - [Q: I cannot build my JavaScript or TypeScript application with `spin build`.](#q-i-cannot-build-my-javascript-or-typescript-application-with-spin-build)
  - [Learning Summary](#learning-summary)
  - [Navigation](#navigation)

The first module will guide you through installing the prerequisites for completing the first part of this workshop.

## Configuring your local environment for Spin

    First, you have to install and configure [Spin](https://fermyon.com/spin) by following the [instructions for your operating system from the Spin documentation](https://developer.fermyon.com/spin/install). This workshop assumes you're using Spin 2.5. You can check your version of Spin, by running `spin -V`.

Templates and plugins required:
TODO - DOTNET!!!
```bash
$ spin plugins update
$ spin plugins install cloud
$ spin plugins install js2wasm
$ spin plugins install py2wasm
```

Depending on the programming languages you want to use, you will need to configure their [toolchains](https://developer.fermyon.com/spin/v2/quickstart#install-the-tools). For example:

- [Rust](https://www.rust-lang.org/learn/get-started)
  - Make sure to add the Wasm/WASI target: `rustup target install wasm32-wasi`
- [TypeScript](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Python](https://www.python.org/downloads/)
- [Go](https://go.dev/doc/install)
  - Also requires [TinyGo](https://tinygo.org/getting-started/install)

### Using a DevContainer
TODO
You will be able to use a developer container for some parts of the workshop. One is provided here in this repository, which has everything you need to complete the first sections.

## Troubleshooting

### Q: I cannot build my Rust application with `spin build`.

A: Make sure you have [configured your Rust toolchain](https://www.rust-lang.org/tools/install), and have added the `wasm32-wasi` target using `rustup target add wasm32-wasi`.

### Q: I cannot build my JavaScript or TypeScript application with `spin build`.

A: Make sure you have [configured Node.js and `npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), and that you have executed `npm install` in the directory with your component's `package.json` file that contains the dependencies.

## Learning Summary

In this section you learned how to:

- Install the latest Spin CLI version
- Install the latest Spin templates
- Install the latest Spin plugins

## Navigation
TODO

- Proceed to [1. Getting started with Spin and WebAssembly](01-spin-getting-started.md)

Let us know what you think in this short [Survey](https://fibsu0jcu2g.typeform.com/workshop).
