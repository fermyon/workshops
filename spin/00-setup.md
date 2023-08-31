# Setup

There are a few ways to set up the development environment in order to follow this workshop:

- [configuring your local environment](#a-configuring-your-local-environment)
- [using a local dev container](#b-using-a-local-dev-container-with-vs-code)
- [using GitHub Codespaces](#c-using-github-codespaces)

If working on your machine (i.e. not using GitHub Codespaces), first clone the repository locally:

```bash
git clone https://github.com/fermyon/workshops && cd workshops
```

### a. Configuring your local environment

First, you have to configure [Spin](https://fermyon.com/spin) by following the [instructions for your operating system from the Spin documentation](https://developer.fermyon.com/spin/install).

For example, to install Spin from Linux, macOS, or WSL2, run the following commands:

```bash
curl -fsSL https://developer.fermyon.com/downloads/install.sh | bash
sudo mv spin /usr/local/bin/
```

Alternatively, you can [manually install from a GitHub release](https://github.com/fermyon/spin/releases), or you can [build Spin from source](https://developer.fermyon.com/spin/contributing-spin).

At this point, you should be able to run Spin commands:

```bash
spin --version
```

Now you can configure the templates and plugins we will use as part of this workshop:

```bash
# Install the official Spin templates.
spin templates install --git https://github.com/fermyon/spin --update
spin templates install --git https://github.com/fermyon/spin-js-sdk --update

# Install a few templates we will use to build applications.
spin templates install --git https://github.com/radu-matei/spin-kv-explorer --update
spin templates install --git https://github.com/radu-matei/spin-nextjs --update

# Install the JavaScript plugin for Spin.
spin plugin install js2wasm -y
```

Depending on the programming languages you want to use, you will need to configure their toolchains. For example:

- [Rust](https://www.rust-lang.org/learn/get-started) (including the Wasm/WASI target: `rustup target install wasm32-wasi`)
- [Node.js and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Go](https://go.dev/doc/install) and [TinyGo](https://tinygo.org/getting-started/install)
- [.NET](https://dotnet.microsoft.com/en-us/download/dotnet/7.0)

### b. Using a local dev container with VS Code

This repository contains the necessary files to open the project and develop inside a container, using [Visual Studio Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers).

First [following the VS Code documentation](https://code.visualstudio.com/docs/devcontainers/tutorial) to install and setup the Dev Containers extension for your VS Code. 

Once its installed, clone this workshop repository to your machine using `git clone https://github.com/fermyon/workshops.git`. Open this folder on VS Code.  

Click on View -> Command Palette and look for the "Dev Containers: Reopen in Container" option to open the repository in a Dev Container.
![Open the workshops repository using a VS Code Dev Container](../media/dev-container.png)

To build this container, you can choose the "Dev Containers: Rebuild Container" option in the Command Palette. 

### c. Using GitHub Codespaces

You can complete this workshop using only your browser using [GitHub Codespaces](https://github.com/features/codespaces). To achieve this, navigate to the GitHub repository for this workshop, https://github.com/fermyon/workshops, then click on the "Code" button, then select "Codespaces", click "Create codespace on main`, then follow the instructions:

![Open the repository using GitHub Codespaces](../media/gh-codespace.png)


### Troubleshooting

#### Q: I cannot build my Rust application with `spin build`.

A: Make sure you have [configured your Rust toolchain](https://www.rust-lang.org/tools/install), and have added the `wasm32-wasi` target using `rustup target add wasm32-wasi`.

#### Q: I cannot build my JavaScript or TypeScript application with `spin build`.

A: Make sure you have [configured Node.js and `npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), and that you have executed `npm install` in the directory with your component's `package.json` file that contains the dependencies.

### Learning Summary

In this section you learned how to:

- [x] Install the latest Spin CLI version
- [x] Install the latest Spin templates
- [x] Install the latest Spin plugins

### Navigation

- Proceed to [01 - Getting started with Spin](./01-getting-started.md)
