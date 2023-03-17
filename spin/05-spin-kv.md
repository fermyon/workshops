# Using the Spin Key/Value store to save responses

When using a Magic 8 Ball, usually you can keep asking your question and spinning the ball until you get the answer you want. Not for ours! A no is a no! Let's give our Magic 8 Ball a memory by persisting the questions and responses using Spin's [key/value SDK](https://developer.fermyon.com/spin/kv-store.md).

Let's modify our `magic-8` component to store the questions asked along with the random answer to Spin's key/value store.

We will need to:

1. Change the component to expect a body with a text question (`"Should I get a new haircut?"`).
1. Enable a default key/value store for our component
1. Check if that question has already been asked by looking it up in the key/value store.
    - a: If previously asked, return the previous answer.*
    - b: If not previously asked, generate an answer, store it in the store, and return it.
    > `*` if the previous answer was "Ask again later", follow step b.

## 2: Giving our component access to a KV store

Give your `magic-8-ball` component access to a key/value store by adding `key_value_stores = ["default"]` to the component. It should now look similar to the following:

```toml
[[component]]
id = "magic-8-ball"
source = "target/wasm32-wasi/release/magic_8_ball.wasm"
allowed_http_hosts = []
key_value_stores = ["default"]
[component.trigger]
route = "/magic-8"
[component.build]
command = "cargo build --target wasm32-wasi --release"
```

> Note: the TypeScript component also contains `exclude_files = ["**/node_modules"]`

## 3: Storing questions and answers in our key/value store

Follow the documentation on using the [Spin key/value SDK](https://developer.fermyon.com/spin/kv-store.md#using-the-spin-sdk) to set and a check previous question and answer pairs.

### Learning Summary

In this section you learned how to:

- [x] Persist non-relational data using Spin's default key-value store using the Spin key/value API

### Navigation

- Go back to [04 - Deploy to Fermyon Cloud](04-deploy-fermyon-cloud.md) if you still have questions on previous section
- Otherwise, proceed to [06 - Storing data in an external database](06-external-db.md)