# Deploy your Magic Ball Spin Application to Fermyon Cloud

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

## Custom Domains

Fermyon Cloud also provides a way for you to use your own domain names to provide your users with human-friendly access to your Spin applications. If you do not own a domain, you can purchase one through a domain registrar such as Namecheap and GoDaddy and then point your Spin application to the new custom domain. [This tutorial](https://developer.fermyon.com/cloud/custom-domains-tutorial) runs you through the steps to apply a custom domain to your Spin application running on Fermyon Cloud.

## Learning Summary

In this section you learned how to:

- [x] Deploy a Spin app to Fermyon Cloud using `spin cloud deploy`
- [x] Learnt about custom domains on Fermyon Cloud

## Navigation

- Go back to [05 - Persisting Magic 8 Ball Responses](05-spin-kv.md) if you still have questions on previous section
- Otherwise, proceed to [07 - Storing data in an external database](07-external-db.md)
