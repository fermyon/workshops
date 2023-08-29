# Deploy your Magic Ball Spin Application to Fermyon Cloud

Now, you can deploy our app to Fermyon Cloud and all of your friends & family can get their questions answered with the Magic 8 Ball! Deploying to the Fermyon Cloud is just one step

```bash
$ spin deploy
Uploading magic-8-ball version 0.1.0+r968cd716...
Deploying...
Waiting for application to become ready...... ready
Available Routes:
  magic-8-ball: https://magic-8-ball-xyz.fermyon.app/magic-8
  fileserver: https://magic-8-ball-xyz.fermyon.app (wildcard)
```

In case you have not logged into your Fermyon account, you can run `spin login` and follow the steps. More details on [deploying to the Fermyon Cloud cam be found here](https://developer.fermyon.com/cloud/deploy) 

#### Custom Domains

Fermyon Cloud also provides a way for you to use your own domain names to provide your users with human-friendly access to your Spin applications. If you do not own a domain and you are interested in purchasing one, you can purchase one through a domain registrar such as Namecheap and GoDaddy and then point your Spin application to the new custom domain. [This tutorial](https://developer.fermyon.com/cloud/custom-domains-tutorial ) runs you through the steps to apply a custom domain to your Spin application running on Fermyon Cloud.  

### Learning Summary

In this section you learned how to:

- [x] Deploy a Spin app to Fermyon Cloud using `spin cloud deploy`
- [x] Learnt about custom domains on Fermyon Cloud 

### Navigation

- Go back to [04 - Persisting Magic 8 Ball Responses](04-spin-kv.md) if you still have questions on previous section
- Otherwise, proceed to [06 - Storing data in an external database](06-external-db.md)
