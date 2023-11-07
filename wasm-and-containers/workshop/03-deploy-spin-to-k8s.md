# Deploy your Spin applications to Kubernetes

- [Deploy your Spin applications to Kubernetes](#deploy-your-spin-applications-to-kubernetes)
  - [Pre-requisites](#pre-requisites)
  - [1. Create and Configure the k3d cluster](#1-create-and-configure-the-k3d-cluster)
  - [2a. Deploy you application to Kubernetes](#2a-deploy-you-application-to-kubernetes)
  - [2b. Package your Spin app using the k8s plugin](#2b-package-your-spin-app-using-the-k8s-plugin)
  - [2c. Hello World Runwasi](#2c-hello-world-runwasi)
    - [Deploy the workloads](#deploy-the-workloads)
  - [3. Cleanup](#3-cleanup)
  - [Quick Reference for this Section](#quick-reference-for-this-section)
    - [2a. Deploy you application to Kubernetes](#2a-deploy-you-application-to-kubernetes-1)
    - [2b. Package your Spin app using the k8s plugin](#2b-package-your-spin-app-using-the-k8s-plugin-1)
    - [2c. Hello World Runwasi](#2c-hello-world-runwasi-1)
  - [Learning Summary](#learning-summary)
  - [Navigation](#navigation)


So far, you've created a Spin application and packages it in to a container. In this section the goal is to get the application running in a Kubernetes cluster.

In this section we will be using k3d, which "makes it very easy to create single- and multi-node k3s clusters in docker, e.g. for local development on Kubernetes." - https://k3d.io/

> **Note**
> The section [Quick Reference for this Section](#quick-reference-for-this-section), at the end of this page, contains all the commands and code needed to complete this module, for a quick reference.

## Pre-requisites

In addition to the requirements from the previous sections, you'll need the following to installed:

- [k3d](https://k3d.io/v5.4.6/#installation)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)


## 1. Create and Configure the k3d cluster

The first step is to create a k3d cluster with the wasm shims installed:

```bash
k3d cluster create wasm-cluster --image ghcr.io/deislabs/containerd-wasm-shims/examples/k3d:v0.9.2 -p "8081:80@loadbalancer" --agents 2
```

Using the `ghcr.io/deislabs/containerd-wasm-shims/examples/k3d:v0.9.2` for the k3d cluster, will give us a Kubernetes cluster with the shims installed and configured.

We have provided three alternate ways for you to try running a WebAssembly container in a Kubernetes cluster, please pick any (or all) of the below for the reminder of this section.

- [Deploy your Spin applications to Kubernetes](#deploy-your-spin-applications-to-kubernetes)
  - [Pre-requisites](#pre-requisites)
  - [1. Create and Configure the k3d cluster](#1-create-and-configure-the-k3d-cluster)
  - [2a. Deploy you application to Kubernetes](#2a-deploy-you-application-to-kubernetes)
  - [2b. Package your Spin app using the k8s plugin](#2b-package-your-spin-app-using-the-k8s-plugin)
  - [2c. Hello World Runwasi](#2c-hello-world-runwasi)
    - [Deploy the workloads](#deploy-the-workloads)
  - [3. Cleanup](#3-cleanup)
  - [Quick Reference for this Section](#quick-reference-for-this-section)
    - [2a. Deploy you application to Kubernetes](#2a-deploy-you-application-to-kubernetes-1)
    - [2b. Package your Spin app using the k8s plugin](#2b-package-your-spin-app-using-the-k8s-plugin-1)
    - [2c. Hello World Runwasi](#2c-hello-world-runwasi-1)
  - [Learning Summary](#learning-summary)
  - [Navigation](#navigation)


## 2a. Deploy you application to Kubernetes

WebAssembly containers are identified using a `RuntimeClass`. The following RuntimeClass definition tells containerd whish shim to use for the RuntimeClass `wasmtime-spin`. First create a file called `spin-runtime.yaml`:

```bash
$ touch spin-runtime.yaml
```

The add the following to the file.

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: wasmtime-spin
handler: spin
```

Apply the definition to your cluster:

```bash
$ kubectl apply -f spin-runtime.yaml
```

Next, you'll need a definition for the deployment, a service , and ingress configuration for the application. The cluster is configured to use Traefik for ingress.

Start by creating a file called `spin-app.yaml`

```bash
$ touch spin-app.yaml
```

Before adding the below content to the file, make sure to change the image to point to the container image you built in the previous section. You can choose to leave it pointing to the sample below `ghcr.io/deislabs/containerd-wasm-shims/examples/spin-rust-hello:v0.9.2`, which is a publicly available Hello World app.

> **Note**
>If you've chosen not to push your image to a remote registry, you can import it to the cluster with the following command, prior to applying the deployment specification.
> ```bash
> k3d image import -c wasm-cluster  my-appliation:latest
> ```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wasm-spin
spec:
  replicas: 1
  selector:
    matchLabels:
      app: wasm-spin
  template:
    metadata:
      labels:
        app: wasm-spin
    spec:
      runtimeClassName: wasmtime-spin
      containers:
        - name: spin-hello
          image: ghcr.io/deislabs/containerd-wasm-shims/examples/spin-rust-hello:v0.9.2
          command: ["/"]
          resources: # limit the resources to 128Mi of memory and 100m of CPU
            limits:
              cpu: 100m
              memory: 128Mi
            requests:
              cpu: 100m
              memory: 128Mi
---
apiVersion: v1
kind: Service
metadata:
  name: wasm-spin
spec:
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  selector:
    app: wasm-spin
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wasm-ingress
  annotations:
    ingress.kubernetes.io/ssl-redirect: "false"
    spec.ingressClassName: traefik
    traefik.ingress.kubernetes.io/router.middlewares: default-strip-prefix@kubernetescrd
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: wasm-spin
                port:
                  number: 80
```

Now apply the above definition using, check the pod status, and see if the application responds:

```bash
$ kubectl apply -f spin-app.yaml
$ kubectl get pods  --watch
$ curl localhost:80
Hello, KubeCon!
```

## 2b. Package your Spin app using the k8s plugin

You can also choose to use an experimental [Spin k8s plugin](https://github.com/chrismatteson/spin-plugin-k8s) to package your Spin application inside a Container.

The plugin requires that all modules are available locally and that files are within subdirectories of the working directory.

Install the plugin, scaffold the Dockerfile, build the container, and push it to your container registry. The following example uses the [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

```bash
# Install the plugin
$ spin plugin install -y -u https://raw.githubusercontent.com/chrismatteson/spin-plugin-k8s/main/k8s.json
# Build your app locally
$ spin build
# Scaffold your Dockerfile, passing in the namespace of your registry
$ spin k8s scaffold ghcr.io/my-registry && spin k8s build
# Import your image into the k3d cluster. The name and version should match the name and version in your Spin.toml
$ k3d image import -c wasm-cluster  ghcr.io/my-registry/hello:0.1.0
# Deploy the image
$ spin k8s deploy
# Watch the applications become ready
$ kubectl get pods --watch
# Query the application (modify the endpoint path to match your application name)
$ curl -v http://0.0.0.0:8081/hello
```

> To learn more about each of the `k8s` plugin steps, see the [documentation on running Spin on Kubernetes](https://developer.fermyon.com/spin/kubernetes).

## 2c. Hello World Runwasi

This example uses a set of containers already provided by the [containerd-wasm-shim project](https://github.com/deislabs/containerd-wasm-shims), for you to quickly see WebAssembly containers running in k3d.

### Deploy the workloads

Let's apply the runtime class and workloads for the shim: 
```bash
$ kubectl apply -f https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/runtime.yaml
$ kubectl apply -f https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/workload.yaml
```

Now let's test it out:

```bash
$ kubectl get pods --watch
$ curl -v http://127.0.0.1:8081/spin/hello
```

As you may see from the `workload.yml` file, there are other frameworks supported by the containerd-wasm-shim project.

## 3. Cleanup

You can delete the k3d cluster by running the following command, or simply stop it, using `k3d cluster stop wasm-cluster`, if you want to keep the configuration:

```bash
k3d cluster delete wasm-cluster
```

## Quick Reference for this Section

The below sections contains a quick reference, with all the commands and the code needed for each language to complete this section.

Create the k3d cluster:

```bash
k3d cluster create wasm-cluster --image ghcr.io/deislabs/containerd-wasm-shims/examples/k3d:v0.9.2 -p "8081:80@loadbalancer" --agents 2
```

### 2a. Deploy you application to Kubernetes

RuntimeClass config

```bash
$ touch spin-runtime.yaml
```

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: wasmtime-spin
handler: spin
```

```bash
$ kubectl apply -f spin-runtime.yaml
```

Deployment

```bash
$ touch spin-app.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wasm-spin
spec:
  replicas: 1
  selector:
    matchLabels:
      app: wasm-spin
  template:
    metadata:
      labels:
        app: wasm-spin
    spec:
      runtimeClassName: wasmtime-spin
      containers:
        - name: spin-hello
          image: ghcr.io/deislabs/containerd-wasm-shims/examples/spin-rust-hello:v0.9.2
          command: ["/"]
          resources: # limit the resources to 128Mi of memory and 100m of CPU
            limits:
              cpu: 100m
              memory: 128Mi
            requests:
              cpu: 100m
              memory: 128Mi
---
apiVersion: v1
kind: Service
metadata:
  name: wasm-spin
spec:
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  selector:
    app: wasm-spin
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wasm-ingress
  annotations:
    ingress.kubernetes.io/ssl-redirect: "false"
    spec.ingressClassName: traefik
    traefik.ingress.kubernetes.io/router.middlewares: default-strip-prefix@kubernetescrd
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: wasm-spin
                port:
                  number: 80
```

```bash
$ kubectl apply -f spin-app.yaml
$ kubectl get pods  --watch
$ curl localhost:80
Hello, KubeCon!
```

### 2b. Package your Spin app using the k8s plugin

```bash
$ spin plugin install -y -u https://raw.githubusercontent.com/chrismatteson/spin-plugin-k8s/main/k8s.json
$ spin build
$ spin k8s scaffold ghcr.io/my-registry && spin k8s build
$ k3d image import -c wasm-cluster  ghcr.io/my-registry/hello:0.1.0
$ spin k8s deploy
$ kubectl get pods --watch
$ curl -v http://0.0.0.0:8081/hello
```

### 2c. Hello World Runwasi

```bash
$ kubectl apply -f https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/runtime.yaml
$ kubectl apply -f https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/workload.yaml
$ kubectl get pods --watch
$ curl -v http://127.0.0.1:8081/spin/hello
```

## Learning Summary

In this section you learned how to:

- Use the containerd Wasm shim to package a Spin app within a Docker container
- Deploy a containerized Spin app to a Kubernetes cluster 

## Navigation

- Proceed to [4. Deploy your Spin applications to Azure Kubernetes Service (AKS)](04-azure-kubernetes-service.md)

Let us know what you think in this short [Survey](https://fibsu0jcu2g.typeform.com/workshop).
