# Run your first spin application on k3d

## What is runwasi?

Kubernets uses [containerd](https://containerd.io/) as its container runtime. Containerd pulls OCI images from registries and delegates the task of execution of containers to lower level runtime known as a shim.

[runwasi](https://github.com/containerd/runwasi) operates as a containerd shim and allows you to run WebAssembly System Interface (WASI) applications on Kubernetes. It is governed by the CNCF Containerd project, and is a great way to get started with WASI and WebAssembly on Kubernetes.

In this workshop, we will use [k3d](https://k3d.io/) to create a local Kubernetes cluster with the spin shim installed and configured. The spin shim uses runwasi as a library to facility the execution of spin applications on Kubernetes.

## Pre-requisites

Before you begin, you need to have the following installed:

- [Docker](https://docs.docker.com/install/) version 4.13.1 (90346) or later with [containerd enabled](https://docs.docker.com/desktop/containerd/)
- [k3d](https://k3d.io/v5.4.6/#installation)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

## Start k3d cluster

The shell script below will create a k3d cluster locally with the Wasm shims installed and containerd configured.

```
k3d cluster create wasm-cluster --image ghcr.io/deislabs/containerd-wasm-shims/examples/k3d:v0.5.1 -p "8081:80@loadbalancer" --agents 2
```

## Deploy the workloads

Let's apply the runtime class and workloads for the shim: 
```
kubectl apply -f https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/runtime.yaml
kubectl apply -f https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/workload.yaml
```

> If you have trouble with the Internet connection, you can find the files in the `apps/01` directory of this repo.

Now let's test it out:
```
echo "waiting 5 seconds for workload to be ready"
sleep 5
curl -v http://127.0.0.1:8081/spin/hello
```

## Cleanup

Bring down your `k3d` cluster:

```bash
k3d cluster delete wasm-cluster
```

### Learning Summary

In this section you learned how to:

- [x] Create a k3d cluster with the Wasm shims installed and containerd configured
- [x] Deploy the runtime class and workloads for the shim
- [x] Test the the spin application

### Navigation
- Go back to [1. Getting started with Spin](01-spin-getting-started.md) if you still have questions on previous section
- Otherwise, proceed to [3. Deploying Spin applications to Kubernetes](03-deploy-spin-to-k8s.md)
- (_optionally_) If finished, let us know what you thought of the Spin and the workshop with this [short Typeform survey](https://fibsu0jcu2g.typeform.com/to/RK08OLSy#hubspot_utk=xxxxx&hubspot_page_name=xxxxx&hubspot_page_url=xxxxx).