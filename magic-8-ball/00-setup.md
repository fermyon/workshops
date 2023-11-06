# Setup

There are a few ways to set up the development environment in order to follow this workshop:
- [A: configuring your local environment](#configuring-your-local-environment)
- [B: using a local dev container](#using-a-local-dev-container-with-vs-code)
- [C: using GitHub Codespaces](#using-github-codespaces)

If working on your machine (i.e. not using GitHub Codespaces), first clone the repository locally:

```bash
$ git clone https://github.com/fermyon/workshops && cd workshops
```

### Option A: Configuring your local environment

First, you have to configure [Spin](https://fermyon.com/spin) by following the [instructions for your operating system from the Spin documentation](https://developer.fermyon.com/spin/install).

For Linux (including WSL2) and macOS, you have the option to use HomeBrew

```bash
brew tap fermyon/tap
brew install fermyon/tap/spin
```

For Windows (not WSL2), see here: 

Alternatively, you can [manually install from a GitHub release](https://github.com/fermyon/spin/releases), or you can [build Spin from source](https://developer.fermyon.com/spin/contributing-spin).

At this point, you should be able to run Spin commands:

```bash
spin --version
```

If you installed Spin using the install script, it also installs the plugins and templates needed for this workshop. If you used another method to install Spin, install the templates and plugins necessary for the workshop like so:

You may also find the following templates helpful for extending beyond the workshop.

```bash
# Install a few templates we will use to build applications.
$ spin templates install --git https://github.com/radu-matei/spin-kv-explorer --update
$ spin templates install --git https://github.com/radu-matei/spin-nextjs --update
```

Depending on the programming languages you want to use, you will need to configure their toolchains. For example:

- [Rust](https://www.rust-lang.org/learn/get-started) (including the Wasm/WASI target: `rustup target install wasm32-wasi`)
- [Node.js and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Go](https://go.dev/doc/install) and [TinyGo](https://tinygo.org/getting-started/install)
- [.NET](https://dotnet.microsoft.com/en-us/download/dotnet/7.0)

### Option B: Using a local dev container with VS Code

This repository contains the necessary files to open the project and develop inside a container, using [Visual Studio Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers).

> Note: Spin currently cannot run using QEMU. For macOS on Apple Silicon, you have to configure Docker Desktop to **Use Rosetta for x86/amd64 emulation on Apple Silicon**. You can enable this under **Settings** -> **Features in development** in Docker Desktop.

After [following the VS Code documentation](https://code.visualstudio.com/docs/devcontainers/tutorial), you can open the directory in a container:

![Open the workshops repository using a VS Code Dev Container](../media/dev-container.png)

### Option C: Using GitHub Codespaces

You can complete this workshop using only your browser using [GitHub Codespaces](https://github.com/features/codespaces). To achieve this, navigate to the GitHub repository for this workshop, https://github.com/fermyon/workshops, then click on the "Clone, open, or download button", then select "Codespaces", click "Create codespace on main`, then follow the instructions:

![Open the repository using GitHub Codespaces](../media/gh-codespace.png)

### Troubleshooting

#### Q: I cannot build my Rust application with `spin build`.

A: Make sure you have [configured your Rust toolchain](https://www.rust-lang.org/tools/install), and have added the `wasm32-wasi` target using `rustup target add wasm32-wasi`.

#### Q: I cannot build my JavaScript or TypeScript application with `spin build`.

A: Make sure you have [configured Node.js and `npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), and that you have executed `npm install` in the directory with your component's `package.json` file that contains the dependencies.

### Learning Summary
In this section you learned how to:
- [x] Install the latest Spin CLI version (canary)
- [x] Install the latest Spin templates 
- [x] Install the latest Spin plugins (canary for JS)

### Navigation
* Proceed to [01 - Getting started with Spin](./01-getting-started.md)