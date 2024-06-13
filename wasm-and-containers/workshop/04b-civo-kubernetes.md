
Now we are ready to deploy to Civo's Kubernetes service.

## 1. Create a Civo Account

Head over to https://civo.com and create an account if you don't have one already.

## 2. Create a Kubernetes cluster

Through the dashboard or from the commandline, create a new Kubernetes cluster. The defaults should be fine for our purposes.

```
$ civo kubernetes create kwasm 
# This configures kubectl for you
$ civo kubernetes config kwasm --save
```

## 3. Configure Spin runtime on Civo Kubernetes

The easiest way to get Spin support in Civo is to use the excellent [KWasm](https://kwasm.sh/) project.

> If you are using the [Quickstart guide](https://kwasm.sh/quickstart/), follow the instructions for Civo and Spin

First, we'll add the Helm charts for KWasm:

```
$ helm repo add kwasm http://kwasm.sh/kwasm-operator/
```

Next, install the KWasm operator and enable Wasm support on your nodes.

```
$ helm install -n kwasm --create-namespace kwasm-operator kwasm/kwasm-operator
$ kubectl annotate node --all kwasm.sh/kwasm-node=true
```

At this point, you should have the `runwasi` support for `containerd` added and `spin` configured as an executor.


## 4. Deploy a Spin app to the Kubernetes cluster

At this point, we can deploy the same Kubernetes manifest we created in [Part 3](03-deploy-spin-to-k8s.md).

Assuming you used `spin k8s scaffold`, you will have a `deploy.yaml`. You can deploy that app using `kubectl apply -f deploy.yaml`.

Here's the quick reference for what we did there:

```bash
$ spin plugin install -y -u https://raw.githubusercontent.com/chrismatteson/spin-plugin-k8s/main/k8s.json
$ spin build
$ spin k8s scaffold ghcr.io/my-registry
$ spin registry push ghcr.io/my-registry/my-application:v0.1.0
$ kubectl apply -f deploy.yaml
$ kubectl get service my-application # This will tell you how to access your app
```

Remember to change your registry from `ghcr.io/my-registry` to whatever registry you prefer to use.
