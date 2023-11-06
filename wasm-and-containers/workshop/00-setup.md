# Setup

## Overview of required software to compete the workshop

TODO
- Use a developer Container - here:
- Spin
- Container thingy (Docker Desktop, Rancher, others?)
- K3d
- ...

### Configuring your local environment for Spin

First, you have to install and configure [Spin](https://fermyon.com/spin) by following the [instructions for your operating system from the Spin documentation](https://developer.fermyon.com/spin/install).

> **Note** If you're not using one of the scripted installation methods (Homebrew or the install script). You need to install the following templates and plugins in addition to getting the Spin binary:

TODO - Update the above

Depending on the programming languages you want to use, you will need to configure their toolchains. For example:

This workshop assumes you're using Spin 2.0. You can check your version of Spin, by running `spin -V`.

- [Rust](https://www.rust-lang.org/learn/get-started) (including the Wasm/WASI target: `rustup target install wasm32-wasi`)
- [Node.js and NPM for TypeScript](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Python](https://www.python.org/downloads/)
- [Go](https://go.dev/doc/install) and [TinyGo](https://tinygo.org/getting-started/install)

### Troubleshooting

#### Q: I cannot build my Rust application with `spin build`.

A: Make sure you have [configured your Rust toolchain](https://www.rust-lang.org/tools/install), and have added the `wasm32-wasi` target using `rustup target add wasm32-wasi`.

#### Q: I cannot build my JavaScript or TypeScript application with `spin build`.

A: Make sure you have [configured Node.js and `npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), and that you have executed `npm install` in the directory with your component's `package.json` file that contains the dependencies.

### Learning Summary

In this section you learned how to:

- Install the latest Spin CLI version
- Install the latest Spin templates
- Install the latest Spin plugins

### Navigation

- Proceed to [1. Run your first wasm app on k3d](01-run-your-first-wasm-on-k3d.md) if you still have questions on previous section
