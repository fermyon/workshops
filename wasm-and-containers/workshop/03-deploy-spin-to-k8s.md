# Deploy your Spin applications to Kubernetes

We can deploy Spin applications on Kubernetes using a [Wasm `containerd` shim](https://github.com/deislabs/containerd-wasm-shims/blob/main/containerd-shim-spin-v1/quickstart.md).

## Pre-requisites

Before you begin, you need to have the following installed:

- [Docker](https://docs.docker.com/install/) version 4.13.1 (90346) or later with [containerd enabled](https://docs.docker.com/desktop/containerd/)
- [k3d](https://k3d.io/v5.4.6/#installation)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [Spin binary and templates](https://spin.fermyon.dev/quickstart/)
- [Rust](https://www.rust-lang.org/tools/install)

## Start and configure a k3d cluster

Start a k3d cluster with the wasm shims already installed:

```bash
k3d cluster create wasm-cluster --image ghcr.io/deislabs/containerd-wasm-shims/examples/k3d:v0.9.2 -p "8081:80@loadbalancer" --agents 2
```

Apply RuntimeClass for spin applications to use the Spin containerd Wasm shim:

```bash
cat <<EOF | kubectl create -f -
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: wasmtime-spin
handler: spin
EOF
```

## Package your Spin app inside a container

We will use an experimental [Spin k8s plugin](https://github.com/chrismatteson/spin-plugin-k8s) to package our Spin application inside a Container. While Spin supports packaging Spin applications as OCI artifacts with `spin registry`, currently, the `containerd-wasm-shim` expects the Wasm modules to be inside a container. The shim then pulls the module outside of the container when the application is deployed to the cluster. In the future, the shim may support Spin application OCI artifacts, reducing the steps needed to deploy your Spin application to a cluster.

The plugin requires that all modules are available locally and that files are within subdirectories of the working directory. In particular, we need to get the static fileserver module, move our frontend files within this directory, and update our component manifest with the new resource paths.

Install the plugin, scaffold the Dockerfile, build the container, and push it to your container registry. The following example uses the [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

> Note: if creating a Rust app, before deploying the app to Kubernetes, modify the `spin.toml` file to remove the following as the shim does not yet support `spin watch`: `watch = ["src/**/*.rs", "Cargo.toml"]`

```bash
# Install the plugin
$ spin plugin install -y -u https://raw.githubusercontent.com/chrismatteson/spin-plugin-k8s/main/k8s.json
# Build your app locally
$ spin build
# Scaffold your Dockerfile, passing in the namespace of your registry
$ spin k8s scaffold ghcr.io/my-registry  && spin k8s build
# Import your image into the k3d cluster
$ k3d image import -c wasm-cluster  ghcr.io/my-registry/hello-typescript:0.1.0
# After making sure it is a publicly accessible container or adding a regcred to your `deploy.yaml`
$ spin k8s deploy
# Watch the applications become ready
$ kubectl get pods --watch
# Query the application (modify the endpoint path to match your application name)
$ curl -v http://0.0.0.0:8081/hello-typescript
```

> To learn more about each of the `k8s` plugin steps, see the [documentation on running Spin on Kubernetes](https://developer.fermyon.com/spin/kubernetes).

## Cleanup

Bring down your `k3d` cluster:

```bash
k3d cluster delete wasm-cluster
```

### Learning Summary

In this section you learned how to:

- [x] Use the containerd Wasm shim to package a Spin app within a Docker container
- [x] Deploy a containerized Spin app to a Kubernetes cluster 

### Navigation
- Go back to [2. Getting started with Spin](02-spin-getting-started.md) if you still have questions on previous section
- (_optionally_) If finished, let us know what you thought of the Spin and the workshop with this [short Typeform survey](https://fibsu0jcu2g.typeform.com/to/RK08OLSy#hubspot_utk=xxxxx&hubspot_page_name=xxxxx&hubspot_page_url=xxxxx).
