# Deploy your Application

In this module you'll learn how to deploy your application. You can choose to use Fermyon Cloud or a Kubernetes Cluster with SpinKube installed.

## Deploy your Magic Ball Spin Application to Fermyon Cloud

Now, deploy your app to the Fermyon Cloud again and your friends & family can get their questions answered with the Magic 8 Ball! Deploying to the Fermyon Cloud is just one simple step

```bash
$ spin cloud deploy
Uploading magic-eight-ball version 0.1.0 to Fermyon Cloud...
Deploying...
Waiting for application to become ready............. ready
Available Routes:
  magic-eight-ball: https://magic-eight-ball-xyz.fermyon.app/magic-8
  fileserver: https://magic-eight-ball-xyz.fermyon.app (wildcard)
```

In case you have not logged into your Fermyon account, you can run `spin login` and follow the steps. More details on [deploying to the Fermyon Cloud can be found here](https://developer.fermyon.com/cloud/deploy)

### Custom Domains

Fermyon Cloud also provides a way for you to use your own domain names to provide your users with human-friendly access to your Spin applications. If you do not own a domain, you can purchase one through a domain registrar such as Namecheap and GoDaddy and then point your Spin application to the new custom domain. [This tutorial](https://developer.fermyon.com/cloud/custom-domains-tutorial) runs you through the steps to apply a custom domain to your Spin application running on Fermyon Cloud.

## Deploy your Magic Ball Spin Application to SpinKube

In order to deploy your application to SpinKube, you need a SpinKube installation. Head over to the [04 Kubernetes and SpinKube](/wasm-and-containers/workshop/04-kubernetes-and-spinkube.md) module from the Wasm and Containers workshop, and follow part 1 of that module to get a local Kubernetes cluster with SpinKube up and running.

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

Since in this applicaiton we need an LLM, it's highly encouraged to use the Cloud GPU plugin, and use Fermyon Cloud to get access to teh LLM and GPUs. If you have not done so already, follow the instarcutions [here](/magic-8-ball/03-spin-ai.md#optional-using-the-cloud-gpu-plugin-to-test-locally) to initialize the plugin and get a url and access token.

Let's create a secret in our cluster with that access token:

```bash
kubectl create secret generic llm-fermyon-cloud --from-literal=token={your_auth_token_here}
```

Before we can run our application, we need a runtime configuration, as well as a Redis container for our Key Value store.

You can add both to the `app.yaml` file, so it will look like this:

```yaml
apiVersion: core.spinoperator.dev/v1alpha1
kind: SpinApp
metadata:
  name: magic-8-ball
spec:
  image: "ttl.sh/{something_unique}:1h"
  executor: containerd-shim-spin
  replicas: 2
  runtimeConfig:
    keyValueStores:
      - name: "default"
        type: "redis"
        options:
          - name: "url"
            value: "redis://redis"
   llmCompute:
      options:
        - name: "type"
          value: "remote_http"
        - name: "url"
          value: "{your_cloud_gpu_url_goes_here}"
        - name: "auth_token"
          valueFrom:
            secretKeyRef:
              name: "llm-fermyon-cloud"
              key: "token"
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
$ kubectl port-forward svc/magic-8-ball 8080:80
```

Now open a browser and go to http://localhost:8080, and ask the Magis 8 Ball a question.

That's it. We now have our Spin WebAssembly application running in Kubernetes, side-by-side with containers, using Fermyon Cloud for inferencing.


First we need to push the Spin application to an OCI registry.

## Learning Summary

In this section you learned how to:

- [x] Deploy a Spin app to Fermyon Cloud using `spin cloud deploy` or How to deploy to a Kubernetes cluster with SpinKube.
- [x] Learnt about custom domains on Fermyon Cloud

## Navigation

- Go back to [05 - Persisting Magic 8 Ball Responses](05-spin-kv.md) if you still have questions on previous section
- Otherwise, proceed to [07 - Storing data in an external database](07-external-db.md)
- To learn how to deploy this Spin application to Kubernetes using SpinKube, check out this step in our [Wasm and Containers workshop](https://github.com/fermyon/workshops/blob/main/wasm-and-containers/workshop/04-kubernetes-and-spinkube.md). **Note**: This workshop has its own pre-requisites.
