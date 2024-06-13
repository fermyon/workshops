# Deploy your Spin applications to Azure Kubernetes Service (AKS)

- [Deploy your Spin applications to Azure Kubernetes Service (AKS)](#deploy-your-spin-applications-to-azure-kubernetes-service-aks)
  - [1. Create a Free Azure Subscription](#1-create-a-free-azure-subscription)
  - [2. Setting Up the Azure CLI](#2-setting-up-the-azure-cli)
  - [3. Building a WASI Enabled AKS Cluster](#3-building-a-wasi-enabled-aks-cluster)
  - [4. Deploying a Spin Workload to AKS](#4-deploying-a-spin-workload-to-aks)
  - [5. Deleting Azure Resources](#5-deleting-azure-resources)
  - [Quick Reference for this Section](#quick-reference-for-this-section)
  - [Learning Summary](#learning-summary)
  - [Navigation](#navigation)

When the [WASI Node Pool feature](https://learn.microsoft.com/en-us/azure/aks/use-wasi-node-pools) is enabled, Azure Kubernetes Service (AKS) comes with Wasm batteries included. The Spin and Slight shims are both installed on your Kubernetes nodes and the associated runtime classes and node labels are applied. In short, you are ready to deploy Wasm microservices!

## 1. Create a Free Azure Subscription
Signing up for an Azure account is quick, easy, and best of all, free. [Click here to get started](https://aka.ms/kceu2023-wasm).

## 2. Setting Up the Azure CLI
You will need to install the Azure CLI and to add the `aks-preview` feature. You can follow the instructions for ["Before you begin"](https://learn.microsoft.com/en-us/azure/aks/use-wasi-node-pools#before-you-begin) from the WASI Node Pool documentation.

## 3. Building a WASI Enabled AKS Cluster
The following commands will create an Azure Resource Group, an AKS Kubernetes cluster, and a node pool with the WASI Node Pool feature enabled.

```bash
# create the Azure Resource Group
$ az group create -n aks-wasm -l westeurope

# create the AKS cluster within the resource group
$ az aks create -g aks-wasm -n my-wasm-cluster

# create the Spin and Slight enabled node pool (1 node)
$ az aks nodepool add -g aks-wasm --cluster-name my-wasm-cluster --name wasipool --workload-runtime WasmWasi

# fetch the AKS cluster credentials and merge them into your kubectl context.
$ az aks get-credentials -g aks-wasm -n my-wasm-cluster
```

The subsequent commands assume a default virtual machine SKU which may or may not be available for your subscription. If you encounter an error with the default VM SKU, please add `-s some_specific_sku` flag to the end of the `az aks` commands. The error message returned will list the available SKUs for your subscription.

## 4. Deploying a Spin Workload to AKS
Before we deploy our workflow, let's ensure that the runtime class we need are applied to the cluster.

```bash
$ kubectl get runtimeclasses
NAME                 HANDLER   AGE
wasmtime-slight-v1   slight    20h
wasmtime-spin-v1     spin      20h
```

The subsequent command shows us we have 2 runtime classes installed, slight and spin runtimes. Let's explore the `wasmtime-spin-v1` runtime class.

```bash
$ kubectl get runtimeclasses wasmtime-spin-v1 -o yaml
apiVersion: node.k8s.io/v1
handler: spin
kind: RuntimeClass
metadata:
  name: wasmtime-spin-v1
scheduling:
  nodeSelector:
    kubernetes.azure.com/wasmtime-spin-v1: "true"
```

In the subsequent command, you can see the `wasmtime-spin-v1` runtime class maps to the `spin` containerd handler, which is registered on nodes in the cluster.

Now let's deploy a Spin Wasm microservice into our AKS cluster.

Save the following to a file called `spin.yaml`
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
      runtimeClassName: wasmtime-spin-v1
      containers:
        - name: hello-spin
          image: ghcr.io/deislabs/containerd-wasm-shims/examples/spin-rust-hello:v0.5.1
          command: ["/"]
          resources:
            requests:
              cpu: 10m
              memory: 10Mi
            limits:
              cpu: 500m
              memory: 128Mi
---
apiVersion: v1
kind: Service
metadata:
  name: wasm-spin
spec:
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  selector:
    app: wasm-spin
```

```bash
# apply a service and a deployment containing a published spin application
$ kubectl apply -f ./spin.yaml
```

Now, let's see our pods running and curl our running service.

```bash
$ kubectl get pods -o wide
NAME                                                   READY   STATUS        RESTARTS   AGE    IP            NODE                               NOMINATED NODE   READINESS GATES
wasm-spin-84cc9d586-nmg5h                            1/1     Running       0          45m    10.244.5.60   aks-wasipool-27743152-vmss000001   <none>           <none>

$ kubectl get service
NAME          TYPE           CLUSTER-IP    EXTERNAL-IP      PORT(S)        AGE
kubernetes    ClusterIP      10.0.0.1      <none>           443/TCP        22h
wasm-spin   LoadBalancer   10.0.67.191   20.165.136.242   80:31240/TCP   68m
```

After running the subsequent commands, you will see similar, but slightly different output. Copy the `EXTERNAL-IP` of your service and curl the following URI substituting your external IP address.

The following is an example using a cluster I built earlier.

```bash
$ curl http://20.165.136.242/hello
Hello world from Spin!
```

We can see we get a response from our Wasm pod, now let's take a look at the pod logs.

```bash
$ kubectl logs wasm-spin-5499569dfd-d24tv
Hello, world! You should see me in pod logs
```

Congrats!! You have a running Wasm microservice in AKS.

## 5. Deleting Azure Resources
To delete all the resources you've created, run the following command.

```bash
$ az group delete -n aks-wasm -y --no-wait
```

## Quick Reference for this Section

The below sections contains a quick reference, with all the commands and the code needed for each language to complete this section.

```bash
# create the Azure Resource Group
$ az group create -n aks-wasm -l westeurope

# create the AKS cluster within the resource group
$ az aks create -g aks-wasm -n my-wasm-cluster

# create the Spin and Slight enabled node pool (1 node)
$ az aks nodepool add -g aks-wasm --cluster-name my-wasm-cluster --name wasipool --workload-runtime WasmWasi

# fetch the AKS cluster credentials and merge them into your kubectl context.
$ az aks get-credentials -g aks-wasm -n my-wasm-cluster

$ kubectl get runtimeclasses
NAME                 HANDLER   AGE
wasmtime-slight-v1   slight    20h
wasmtime-spin-v1     spin      20h

$ kubectl get runtimeclasses wasmtime-spin-v1 -o yaml
apiVersion: node.k8s.io/v1
handler: spin
kind: RuntimeClass
metadata:
  name: wasmtime-spin-v1
scheduling:
  nodeSelector:
    kubernetes.azure.com/wasmtime-spin-v1: "true"
```

```yaml
# spin.yaml
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
      runtimeClassName: wasmtime-spin-v1
      containers:
        - name: hello-spin
          image: ghcr.io/deislabs/containerd-wasm-shims/examples/spin-rust-hello:v0.5.1
          command: ["/"]
          resources:
            requests:
              cpu: 10m
              memory: 10Mi
            limits:
              cpu: 500m
              memory: 128Mi
---
apiVersion: v1
kind: Service
metadata:
  name: wasm-spin
spec:
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  selector:
    app: wasm-spin
```

```bash
$ kubectl apply -f ./spin.yaml

$ kubectl get pods -o wide
NAME                                                   READY   STATUS        RESTARTS   AGE    IP            NODE                               NOMINATED NODE   READINESS GATES
wasm-spin-84cc9d586-nmg5h                            1/1     Running       0          45m    10.244.5.60   aks-wasipool-27743152-vmss000001   <none>           <none>

$ kubectl get service
NAME          TYPE           CLUSTER-IP    EXTERNAL-IP      PORT(S)        AGE
kubernetes    ClusterIP      10.0.0.1      <none>           443/TCP        22h
wasm-spin   LoadBalancer   10.0.67.191   20.165.136.242   80:31240/TCP   68m

$ curl http://20.165.136.242/hello
Hello world from Spin!

$ kubectl logs wasm-spin-5499569dfd-d24tv
Hello, world! You should see me in pod logs

$ az group delete -n aks-wasm -y --no-wait
```

## Learning Summary

In this section you learned how to:

- Create an AKS cluster with support for WebAssembly
- Deploy WebAssembly applications to your AKS cluster

## Navigation

There is no more, it's over, it's the end. Thank you for spending time with us...

... please let us know what you think in this short [Survey](https://fibsu0jcu2g.typeform.com/workshop).
