# Magic K8s Ball

We can also run our Magic 8 Ball Spin application on Kubernetes using a [Wasm `containerd` shim](https://github.com/deislabs/containerd-wasm-shims/blob/main/containerd-shim-spin-v1/quickstart.md).

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
k3d cluster create wasm-cluster --image ghcr.io/deislabs/containerd-wasm-shims/examples/k3d:v0.3.3 -p "8081:80@loadbalancer" --agents 2 --registry-create mycluster-registry:12345
```

Apply RuntimeClass for spin applications to use the spin wasm shim:

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

```bash

curl -LRO https://github.com/fermyon/spin-fileserver/releases/download/v0.0.1/spin_static_fs.wasm
cp -r ../../../../frontend .
```

Update your `fileserver` component manifest:

```
[[component]]
source = "spin_static_fs.wasm"
id = "fileserver"
files = [ { source = "frontend/", destination = "/" } ]
[component.trigger]
route = "/..."
```

Install the plugin, scaffold the dockerfile, build the container, and push it to your container registry. The following example uses the [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

```bash
# Install the plugin
$ spin plugin install -y -u https://raw.githubusercontent.com/chrismatteson/spin-plugin-k8s/main/k8s.json
# Scaffold your Dockerfile, passing in the namespace of your registry
$ spin k8s scaffold ghcr.io/kate-goldenring  && spin k8s build
# Push the container to your container registry
spin k8s push ghcr.io/kate-goldenring 
# After making sure it is a publicly accessible container or adding a regcred to your `deploy.yaml`
spin k8s deploy
```

Now, spin your Magic 8 Ball at `http://127.0.0.1:3000/`.

## Cleanup

Bring down your `k3d` cluster:

```bash
k3d cluster delete wasm-cluster
```
### Navigation
* Go back to [06 - Deploy your Magic Ball Spin Application to Fermyon Cloud](06-deploy-fermyon-cloud.md) if you still have questions on previous section
* Otherwise, congrats on finishing the workshop! 