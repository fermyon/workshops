# Deploy your Spin applications to Azure Kubernetes Service (AKS)

When the [WASI Node Pool feature](https://learn.microsoft.com/en-us/azure/aks/use-wasi-node-pools) is enabled, Azure Kubernetes Service (AKS) comes with Wasm batteries included. The Spin and Slight shims are both installed on your Kubernetes nodes and the associated runtime classes and node labels are applied. In short, you are ready to deploy Wasm microservices!

## Create a Free Azure Subscription
Signing up for an Azure account is quick, easy, and best of all, free. [Click here to get started](https://aka.ms/kceu2023-wasm).

## Setting Up the Azure CLI
You will need to install the Azure CLI and to add the `aks-preview` feature. You can follow the instructions for ["Before you begin"](https://learn.microsoft.com/en-us/azure/aks/use-wasi-node-pools#before-you-begin) from the WASI Node Pool documentation.

## Building a WASI Enabled AKS Cluster
The following commands will create an Azure Resource Group, an AKS Kubernetes cluster, and a node pool with the WASI Node Pool feature enabled.

```shell
# create the Azure Resource Group
az group create -n aks-wasm -l westeurope

# create the AKS cluster within the resource group
az aks create -g aks-wasm -n my-wasm-cluster

# create the Spin and Slight enabled node pool (1 node)
az aks nodepool add -g aks-wasm --cluster-name my-wasm-cluster --name wasipool --workload-runtime WasmWasi

# fetch the AKS cluster credentials and merge them into your kubectl context.
az aks get-credentials -g aks-wasm -n my-wasm-cluster
```

The subsequent commands assume a default virtual machine SKU which may or may not be available for your subscription. If you encounter an error with the default VM SKU, please add `-s some_specific_sku` flag to the end of the `az aks` commands. The error message returned will list the available SKUs for your subscription.

## Deploying a Spin Workload to AKS
Before we deploy our workflow, let's ensure that the runtime class we need are applied to the cluster.

```shell
kubectl get runtimeclasses
NAME                 HANDLER   AGE
wasmtime-slight-v1   slight    20h
wasmtime-spin-v1     spin      20h
```

The subsequent command shows us we have 2 runtime classes installed, slight and spin runtimes. Let's explore the `wasmtime-spin-v1` runtime class.

```shell
kubectl get runtimeclasses wasmtime-spin-v1 -o yaml
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

Now let's deploy a slight Wasm microservice into our AKS cluster.

```shell
# apply a service and a deployment containing a published slight application
kubectl apply -f ../apps/05/spin.yaml
```

Now, let's see our pods running and curl our running service.

```shell
kubectl get pods -o wide
NAME                                                   READY   STATUS        RESTARTS   AGE    IP            NODE                               NOMINATED NODE   READINESS GATES
wasm-spin-84cc9d586-nmg5h                            1/1     Running       0          45m    10.244.5.60   aks-wasipool-27743152-vmss000001   <none>           <none>

kubectl get service
NAME          TYPE           CLUSTER-IP    EXTERNAL-IP      PORT(S)        AGE
kubernetes    ClusterIP      10.0.0.1      <none>           443/TCP        22h
wasm-spin   LoadBalancer   10.0.67.191   20.165.136.242   80:31240/TCP   68m
```

After running the subsequent commands, you will see similar, but slightly different output. Copy the `EXTERNAL-IP` of your service and curl the following URI substituting your external IP address.

The following is an example using a cluster I built earlier.
```shell
curl http://20.165.136.242/hello
Hello world from Spin!
```

We can see we get a response from our Wasm pod, now let's take a look at the pod logs.

```shell
kubectl logs wasm-spin-5499569dfd-d24tv
Hello, world! You should see me in pod logs
```

Congrats!! You have a running Wasm microservice in AKS.

## Deleting Azure Resources
To delete all the resources you've created, run the following command.

```shell
az group delete -n aks-wasm -y --no-wait
```

