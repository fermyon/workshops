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

Install this Spin plugin for Kubernetes:

- [Spin k8s plugin](https://github.com/chrismatteson/spin-plugin-k8s)

```
$ spin plugin install -y -u https://raw.githubusercontent.com/chrismatteson/spin-plugin-k8s/main/k8s.json
```

## 1. Create and Configure the k3d cluster

> See [The Spin Kubernetes docs](https://developer.fermyon.com/spin/v2/kubernetes) for more information on configuring various Kubernetes flavors.

The first step is to create a k3d cluster with the wasm shims installed:

```bash
k3d cluster create wasm-cluster --image ghcr.io/deislabs/containerd-wasm-shims/examples/k3d:v0.11.1 -p "8081:80@loadbalancer" --agents 2 --registry-create mycluster-registry:12345
```

Using the `ghcr.io/deislabs/containerd-wasm-shims/examples/k3d:v0.10.0` for the k3d cluster, will give us a Kubernetes cluster with the shims installed and configured.

We have provided three alternate ways for you to try running a WebAssembly container in a Kubernetes cluster, please pick any (or all) of the below for the reminder of this section.

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

```
$ spin k8s scaffold default

Dockerfile Created
deploy.yaml created
```

Now we have all the files we need to create an OCI image containing our app. (Note that this image is not a Docker container, but a WebAssembly app.)

The `spin registry push` command will push your image to DockerHub or another registry (depending on the path you give it). The following pushes to `my-application` to my own DockerHub account.

```
$ spin registry push technosophos/my-application:v0.1.0
```

> You make need to run `docker login` to log in to the registry you wish to work with.

Once the image has been pushed, update `deploy.yaml` to point to the newly created image:

```yaml
    # Find and edit this part:
    spec:
      runtimeClassName: wasmtime-spin
      containers:
        - name: my-application
          # This is all you need to change:
          image: technosophos/my-application:v0.1.0
          command: ["/"]
          imagePullPolicy: IfNotPresent
```

> **Note**
>If you've chosen not to push your image to a remote registry, you can import it to the cluster with the following command, prior to applying the deployment specification.
> ```bash
> k3d image import -c wasm-cluster my-appliation:latest
> ```

Now apply the above definition using, check the pod status, and see if the application responds:

```bash
$ kubectl apply -f deploy.yaml
deployment.apps/my-application created
service/my-application created
ingress.networking.k8s.io/my-application created
$ kubectl get pods  --watch
$ curl http://localhost/
Hello, KubeCon!
```

### Help! I am getting network errors!

If you cannot access the endpoint, try editing your service to use ClusterIP instead of LoadBalancer, then recreated your application.

In `deploy.yaml`:
```
apiVersion: v1
kind: Service
metadata:
  name: my-application
spec:
  type: ClusterIP
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  selector:
    app: my-application
```

Then delete and re-create:
```
$ kubectl delete -f deploy.yaml
# Wait a minute or so
$ kubectl apply -f deploy.yaml

```

And then map a port forward:
```
$ kubectl port-forward svc/my-application 3000:80
Forwarding from 127.0.0.1:3000 -> 80
Forwarding from [::1]:3000 -> 80
Handling connection for 3000
```

> To learn more about each of the `k8s` plugin steps, see the [documentation on running Spin on Kubernetes](https://developer.fermyon.com/spin/kubernetes).

## 2b. Hello World Runwasi

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
$ spin plugin install -y -u https://raw.githubusercontent.com/chrismatteson/spin-plugin-k8s/main/k8s.json
$ spin build
$ spin k8s scaffold ghcr.io/my-registry && spin k8s build
$ k3d image import -c wasm-cluster  ghcr.io/my-registry/hello:0.1.0
$ spin k8s deploy
$ kubectl get pods --watch
$ curl -v http://0.0.0.0:8081/hello
```

### 2b. Hello World Runwasi

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
