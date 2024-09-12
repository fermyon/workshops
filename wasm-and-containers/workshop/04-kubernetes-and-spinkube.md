# Deploy your Spin applications to Kubernetes using SpinKube

- [Deploy your Spin applications to Kubernetes using SpinKube](#deploy-your-spin-applications-to-kubernetes-using-spinkube)
  - [Pre-requisites](#pre-requisites)
  - [1. Create and Configure the k3d cluster with SpinKube](#1-create-and-configure-the-k3d-cluster-with-spinkube)
  - [2. Deploy you application to Kubernetes](#2-deploy-you-application-to-kubernetes)
  - [3. Cleanup](#3-cleanup)
  - [Learning Summary](#learning-summary)
  - [Navigation](#navigation)


In this section the goal is to get our application up and running in a Kubernetes cluster. [SpinKube](https://www.spinkube.dev) is "...an open source project that streamlines developing, deploying and operating WebAssembly workloads in Kubernetes."

We will be using [k3d](https://k3d.io/), which "makes it very easy to create single- and multi-node k3s clusters for local development on Kubernetes."

> **Note**
> You can choose to use any other Kubernetes distribution or service supporting SpinKube. Check out the [SpinKube tutorials page](https://www.spinkube.dev/docs/spin-operator/tutorials/) for other options

## Pre-requisites

In addition to the requirements from the previous sections, you'll need the following installed:

- [k3d](https://k3d.io/v5.4.6/#installation)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [helm](https://helm.sh/docs/intro/quickstart/#install-helm)

## 1. Create and Configure the k3d cluster with SpinKube

The SpinKube project provides a pre-built container image, with the [containerd](https://containerd.io/) configuration needed to support Spin applications. Spin applications can run on Kubernetes thanks to the [containerd-shim-spin](https://github.com/spinkube/containerd-shim-spin) project.

The following instructions are copied from the [Spin Operator quickstart](https://www.spinkube.dev/docs/spin-operator/quickstart/). Please refer back to the source for further explanations.

```bash
# Create the k3d cluster
$ k3d cluster create wasm-cluster \
  --image ghcr.io/spinkube/containerd-shim-spin/k3d:v0.15.1 \
  --port "8081:80@loadbalancer" \
  --agents 2

# Install required Custom Resource Definitions and Resources
$ kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.3/cert-manager.yaml
$ kubectl apply -f https://github.com/spinkube/spin-operator/releases/download/v0.3.0/spin-operator.runtime-class.yaml
$ kubectl apply -f https://github.com/spinkube/spin-operator/releases/download/v0.3.0/spin-operator.crds.yaml

# Install the Spin Operator
$ helm install spin-operator \
  --namespace spin-operator \
  --create-namespace \
  --version 0.3.0 \
  --wait \
  oci://ghcr.io/spinkube/charts/spin-operator

# Install the Runtime Executor for containerd-shim-spin
$ kubectl apply -f https://github.com/spinkube/spin-operator/releases/download/v0.3.0/spin-operator.shim-executor.yaml
```

To validate your installation, you can follow [these instructions](https://www.spinkube.dev/docs/spin-operator/quickstart/#run-the-sample-application).

## 2. Deploy you application to Kubernetes

With SpinKube, it's possible to deploy Spin applications to Kubernetes, without creating container images consisting of file layers (e.g., with a Dockerfile). As WebAssembly applications are self-contained, we simply need the .wasm file, the Spin manifest, and any potential static asset which goes together with it. All of this is easily packaged  using the `spin registry push` command.

We can use any OCI registry for this. For an easy, publicly-available ephemeral OCI registry, we can use [ttl.sh](https://ttl.sh).

In the directory containing `spin.toml` run the following command:

```bash
$ spin registry push ttl.sh/{something_unique}:1h
```

To see the content of the image, we can inspect the manifest using `docker manifest inspect ttl.sh/{something_unique}:1h`. Note the combined size of the OCI image, which is typically much smaller than a Docker container image.

> **note**
> There are methods to strip a .wasm file for stack trace information, by using [wasm-tools](https://github.com/bytecodealliance/wasm-tools) - e.g., `wasm-tools strip -a app.wasm -o app.wasm`. This can greatly reduce the size of the wasm file.

Once the image has been pushed, we can use the SpinKube Spin plugin:

```bash
# Let's get the plugin - https://www.spinkube.dev/docs/spin-plugin-kube/installation/
$ spin plugins update
$ spin plugins install kube
```

And the scaffold the deployment specification needed to deploy the application:

```bash
$ spin kube scaffold -f ttl.sh/{something_unique}:1h > app.yaml
```

You can open the `app.yaml` file to see the specification:

```yaml
apiVersion: core.spinoperator.dev/v1alpha1
kind: SpinApp
metadata:
  name: {something_unique}
spec:
  image: "ttl.sh/{something_unique}:1h"
  executor: containerd-shim-spin
  replicas: 2
```

Before we can run our application, we need a runtime configuration, as well as a Redis container for our Key Value store.

You can add both to the `app.yaml` file, so it will look like this:

```yaml
apiVersion: core.spinoperator.dev/v1alpha1
kind: SpinApp
metadata:
  name: {something_unique}
spec:
  image: "ttl.sh/{something_unique}:1h"
  executor: containerd-shim-spin
  replicas: 2
  runtimeConfig:
    keyValueStores:
      - name: "redis"
        type: "redis"
        options:
          - name: "url"
            value: "redis://redis"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis
          ports:
            - containerPort: 6379
              name: redis
              protocol: TCP
---
apiVersion: v1
kind: Service
metadata:
  annotations:
    app: redis
  labels:
    app: redis
  name: redis
spec:
  ports:
  - name: tcp-redis
    port: 6379
    protocol: TCP
    targetPort: redis
  selector:
    app: redis
  type: ClusterIP
```

To deploy the combined Redis container and Spin application, run:

```bash
$ kubectl apply -f app.yaml
```

You can now set up a port-forward to the Spin application's service, which is set up by the Spin Operator.

```bash
$ kubectl port-forward svc/{something_unique} 8080:80
```

And then a 'curl' request to the address:

```bash
$ curl -i localhost:8080
```

That's it. We now have our Spin WebAssembly application running in Kubernetes, side-by-side with containers.

## 3. Cleanup

You can delete the k3d cluster by running the following command, or simply stop it, using `k3d cluster stop wasm-cluster`, if you want to keep the configuration:

```bash
k3d cluster delete wasm-cluster
```

## Learning Summary

In this section you learned how to:

- Create a Kubernetes cluster and deploy SpinKube
- Deploy Spin WebAssembly applications and containers side-by-side

## Navigation

- Go back to [3. Set up your local development environment for Spin WebAssembly and containers](./03-local-dev-setup-containers-wasm.md) if you still have questions on previous section

Let us know what you think in this short [Survey](https://fibsu0jcu2g.typeform.com/workshop).
