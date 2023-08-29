# Magic 8 Ball Frontend

Let's make our Magic 8 Ball application more interactive by adding a frontend where you can submit your question to the omniscient 8 ball! To do this, we want to add a new component to our Spin application that can serve the frontend of our application. 
Fortunately, Spin has a [static file server component](https://github.com/fermyon/spin-fileserver) that can be added to any Spin application using `spin add`. Since this will be the base of our application, overwrite the default component trigger with the wildcard `/...` to match all routes. 

We also need to tell the fileserver which frontend files to serve. Choose the default `assets` when asked for the Directory containing the files to serve. In your Spin app's directory create a folder named `assets`. For the purposes of this workshop, we've already prepared an HTML, CSS and JS [frontend](apps/frontend/) that you can reuse. Download these files into the `assets` folder. 

```bash
$ spin add static-fileserver fileserver
HTTP path: /...
Directory containing the files to serve: assets
```

Let's take a look at the `fileserver` component that has now been added to the application manifest (`spin.toml`). In the component there is a [`files` field](https://developer.fermyon.com/spin/writing-apps#including-files-with-components). Since Wasm has a [capability-based](https://github.com/WebAssembly/WASI/blob/ddfe3d1dda5d1473f37ecebc552ae20ce5fd319a/README.md#capability-based-security) security model, a module can only access files that have been explicitly allowed by the Wasm runtime (wasmtime). This tells Spin to enable the module to read those files at runtime. We set the destination for the files to be the root directory as this is where the [`fileserver`](https://github.com/fermyon/spin-fileserver/blob/main/src/lib.rs#L81) module is configured to look for them.

```toml
[[component]]
source = { url = "https://github.com/fermyon/spin-fileserver/releases/download/v0.0.1/spin_static_fs.wasm", digest = "sha256:650376c33a0756b1a52cad7ca670f1126391b79050df0321407da9c741d32375" }
id = "fileserver"
files = [ { source = "assets", destination = "/" } ]
[component.trigger]
route = "/..."
```

Let's look at the frontend implementation. The user asks a question and calls our Magic 8 Ball `magic-8` component to get the response. This is done in the `fetch('../magic-8')` call in the JS portion of the snippet below. You can see that we are also passing the question in the body of the request. We will use this in a later step of the workshop. Don't worry about copying the code snippet below. This is just for illustrative purposes.

```js
const btn= document.getElementById("btn");
btn.addEventListener('click', function(){
    var question = document.getElementById("question").value;
    fetch('../magic-8', { method: 'POST', body: question }).then(response => response.json()).then(data => {
        document.getElementById("triangle").style.display = 'inline-block';
        document.getElementById("circle").style.display = 'inline-block';
        document.getElementById("triangle").innerHTML = '<br><br>' + data.answer;
    })
});
```

Now, we are ready to build and run our application. Run this command and click on the URL to see the Magic 8 Ball frontend. 

```bash
spin build --up
```

### Learning Summary

In this section you learned how to:

- [x] Add a new component to an existing Spin app using `spin add`
- [x] Use the Spin static fileserver component
- [x] Call one Spin component from another Spin component

### Navigation

- Go back to [02 - Building a Magic 8 Ball JSON API with Spin](02-json-api.md) if you still have questions on previous section
- Otherwise, proceed to [04 - Persisting Magic 8 Ball Responses](04-spin-kv.md)
