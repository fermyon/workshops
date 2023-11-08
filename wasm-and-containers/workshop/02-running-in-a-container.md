# Run your first WebAssembly application in a container

- [Run your first WebAssembly application in a container](#run-your-first-webassembly-application-in-a-container)
  - [1. Building a Container with the Application](#1-building-a-container-with-the-application)
  - [More information about Runwasi](#more-information-about-runwasi)
  - [Quick Reference for this Section](#quick-reference-for-this-section)
    - [Using TypeScript](#using-typescript)
    - [Using Rust](#using-rust)
    - [Using Go](#using-go)
    - [Using Python](#using-python)
  - [Learning Summary](#learning-summary)
    - [Navigation](#navigation)

In the previous section we create a Spin application, ran it locally, and deployed it to Fermyon Cloud. All these steps were possible without using containers.

In this section we'll explore how we get the application in to a container, to be able to run it in a container-based runtime, in this case containerd. This is the first step in getting your WebAssembly application to run in Kubernetes.

> **Note**
> The section [Quick Reference for this Section](#quick-reference-for-this-section), at the end of this page, contains all the commands and code needed to complete this module, for a quick reference.

This section requires you to use Docker Desktop.

> **Note**
> You can use ay way of running containers using containerd, with a custom configuration and extra shims. You can read more about how this works [here](https://github.com/deislabs/containerd-wasm-shims).

## 1. Building a Container with the Application

The first step is to build the container image for the application, by creating a `Dockerfile`. As WebAssembly applications are fully self-contained, and don't need to bring any dependencies, the container image will start from `scratch`, with an empty file-system. This is in contrast to many containers, you're used to see, as they typically have an operating system, and other dependencies which they rely on, as the base.

```bash
# Make sure you're in the root folder of the application. The same folder as spin.toml
$ cd my-application
# Create a Dockerfile
$ touch Dockerfile
```

Paste the below into the newly created Dockerfile

```dockerfile
FROM scratch as temp
COPY spin.toml /spin.toml
# Make sure to change the following line, depending on where the compiles wasm is located. This will vary based on the programming language you use. Check the spin.toml file, which has a reference to the file.
COPY target/my-application.wasm target/my-application.wasm

FROM scratch
COPY --from=temp . .
ENTRYPOINT ["/spin.toml"]
```

To build the container image, you can tag it using the fully-qualified tag for later being able to push it to a public registry, like ghcr.io, or use a local name.

```bash
# Substitute ghcr.io/<github-id> with any registry and organization you would like to use, or simply use a local name.
$ docker buildx build --platform wasi/wasm --provenance=false -t ghcr.io/<github-id>/my-application .
```

Note the platform used when building the container `wasi/wasm`. This platform tag is used by the runtime to identify this as a WebAssembly container.

We need to disable `--provenance=false` for the image to work in later sections of this workshop.

To run this particular container, we need a container runtime which supports running WebAssembly and Spin applications. [Docker Desktop](https://docs.docker.com/desktop/wasm/) provides this through [containerd](https://containerd.io/) and [runwasi](https://github.com/containerd/runwasi), using the [Spin shim from Deislabs](https://github.com/deislabs/containerd-wasm-shims).

In Docker Desktop, you'll have to enable two experimental features, to get support for Wasm.
In Docker Desktop 4.25.0, you'll need to enable them one by one:
  1. Open the Docker Desktop Dashboard
  2. Choose "Features in development"
  3. Check "Use containerd for pulling and storing images"
  4. Click "Apply & restart"
  5. Check "Enable Wasm"
  6. Click "Apply & restart" - You should now see a small progress bar saying "Installing"

Once you've enabled these features, we can run our container with the Spin application:

```bash
# Remember to substitute ghcr.io/<github-id> with the registry and organization you used when building the image.
$ docker run -d --platform=wasi/wasm --runtime=io.containerd.spin.v1 -p 3000:80 ghcr.io/<github-id>/my-application
$ curl localhost:3000
Hello KubeCon!
```

You can push this image to a remote registry using `docker push`, if you want to be able to use this in other places.

## More information about Runwasi

Kubernetes uses [containerd](https://containerd.io/) as its container runtime. Containerd pulls OCI images from registries and delegates the task of execution of containers to a lower level runtime known as a shim.

[Runwasi](https://github.com/containerd/runwasi) operates as a containerd shim and allows you to run WebAssembly System Interface (WASI) applications on Kubernetes. It is governed by the CNCF containerd project, and is a great way to get started with WASI and WebAssembly on Kubernetes.

In the following sections, we will use [k3d](https://k3d.io/) to create a local Kubernetes cluster with the spin shim installed and configured. The spin shim uses runwasi as a library to facility the execution of spin applications on Kubernetes.

## Quick Reference for this Section

The below sections contains a quick reference, with all the commands and the code needed for each language to complete this section.

### Using TypeScript

```bash
# Make sure you're in the root folder of the application. Same folder as spin.toml
$ cd my-application
# Create the Dockerfile
$ touch Dockerfile
```

```dockerfile
FROM scratch as temp
COPY spin.toml /spin.toml
COPY target/my-application.wasm target/my-application.wasm

FROM scratch
COPY --from=temp . .
ENTRYPOINT ["/spin.toml"]
```

```bash
# Substitute ghcr.io/<github-id> with any registry and organization you would like to use, or simply use a local name.
$ docker buildx build --platform wasi/wasm --provenance=false -t ghcr.io/<github-id>/my-application .
$ docker run -d --platform=wasi/wasm --runtime=io.containerd.spin.v1 -p 3000:80 ghcr.io/<github-id>/my_application
$ curl localhost:3000
Hello KubeCon!
```

### Using Rust

```bash
# Make sure you're in the root folder of the application. Same folder as spin.toml
$ cd my-application
# Create the Dockerfile
$ touch Dockerfile
```

```dockerfile
FROM scratch as temp
COPY spin.toml /spin.toml
COPY target/wasm32-wasi/release/my_application.wasm target/wasm32-wasi/release/my_application.wasm

FROM scratch
COPY --from=temp . .
ENTRYPOINT ["/spin.toml"]
```

```bash
# Substitute ghcr.io/<github-id> with any registry and organization you would like to use, or simply use a local name.
<<<<<<< Updated upstream
$ docker buildx build --platform wasi/wasm -t ghcr.io/<github-id>/my-application .
$ docker run -d --platform=wasi/wasm --runtime=io.containerd.spin.v1 -p 3000:80 ghcr.io/<github-id>/my_application
=======
$ docker buildx build --platform wasi/wasm --provenance=false -t ghcr.io/<github-id>/my-application .
$ docker run -d --platform=wasi/wasm --runtime=io.containerd.spin.v1 -p 80:3000 ghcr.io/<github-id>/my_application
>>>>>>> Stashed changes
$ curl localhost:3000
Hello KubeCon!
```

### Using Go

```bash
# Make sure you're in the root folder of the application. Same folder as spin.toml
$ cd my-application
# Create the Dockerfile
$ touch Dockerfile
```

```dockerfile
FROM scratch as temp
COPY spin.toml /spin.toml
COPY main.wasm /main.wasm

FROM scratch
COPY --from=temp . .
ENTRYPOINT ["/spin.toml"]
```

```bash
# Substitute ghcr.io/<github-id> with any registry and organization you would like to use, or simply use a local name.
<<<<<<< Updated upstream
$ docker buildx build --platform wasi/wasm -t ghcr.io/<github-id>/my-application .
$ docker run -d --platform=wasi/wasm --runtime=io.containerd.spin.v1 -p 3000:80 ghcr.io/<github-id>/my_application
=======
$ docker buildx build --platform wasi/wasm --provenance=false -t ghcr.io/<github-id>/my-application .
$ docker run -d --platform=wasi/wasm --runtime=io.containerd.spin.v1 -p 80:3000 ghcr.io/<github-id>/my_application
>>>>>>> Stashed changes
$ curl localhost:3000
Hello KubeCon!
```

### Using Python

```bash
# Make sure you're in the root folder of the application. Same folder as spin.toml
$ cd my-application
# Create the Dockerfile
$ touch Dockerfile
```

```dockerfile
FROM scratch as temp
COPY spin.toml /spin.toml
COPY app.wasm /app.wasm

FROM scratch
COPY --from=temp . .
ENTRYPOINT ["/spin.toml"]
```

```bash
# Substitute ghcr.io/<github-id> with any registry and organization you would like to use, or simply use a local name.
<<<<<<< Updated upstream
$ docker buildx build --platform wasi/wasm -t ghcr.io/<github-id>/my-application .
$ docker run -d --platform=wasi/wasm --runtime=io.containerd.spin.v1 -p 3000:80 ghcr.io/<github-id>/my_application
=======
$ docker buildx build --platform wasi/wasm --provenance=false -t ghcr.io/<github-id>/my-application .
$ docker run -d --platform=wasi/wasm --runtime=io.containerd.spin.v1 -p 80:3000 ghcr.io/<github-id>/my_application
>>>>>>> Stashed changes
$ curl localhost:3000
Hello KubeCon!
```

## Learning Summary

In this section you learned how to:

- Create a Docker container which contains the Spin application
- Configure Docker Desktop to run WebAssembly workloads
- Build and run a Docker Container with a Spin application

### Navigation

- Proceed to [3. Deploy your Spin applications to Kubernetes](03-deploy-spin-to-k8s.md)

Let us know what you think in this short [Survey](https://fibsu0jcu2g.typeform.com/workshop).
