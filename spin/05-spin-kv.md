# Using the Spin Key/Value store to save responses

When using a Magic 8 Ball, usually you can keep asking your question and spinning the ball until you get the answer you want. Not for ours though! This Magic 8 Ball has a memory. This is achieved by persisting the questions and responses using Spin's [key/value store](https://developer.fermyon.com/spin/kv-store-api-guide).

Let's modify our `magic-8` component to store the questions asked, along with the random answer to Spin's key/value store.

We will need to:

1. Change the component to expect a body with a text question (`"Should I get a new haircut?"`).
1. Enable a default key/value store for our component
1. Check if that question has already been asked by looking it up in the key/value store.
    - a: If previously asked, return the previous answer.*
    - b: If not previously asked, generate an answer, store the answer in the KV store, and return it.
    > `*` if the previous answer was "Ask again later", follow step b.

## 1: Giving our component access to a KV store

Give your `magic-8-ball` component access to a key/value store by adding `key_value_stores = ["default"]` to the component in your `spin.toml` file. Here's how it would look in **Rust**

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

Here's how `spin.toml` would look like in **Typescript**

```typescript
[[component]]
id = "magic-8-ball"
source = "target/magic-8-ball.wasm"
exclude_files = ["**/node_modules"]
key_value_stores = ["default"]
[component.trigger]
route = "/magic-8"
[component.build]
command = "npm run build"
```

## 2: Storing questions and answers in our key/value store

The Spin SDK surfaces the Spin key value store interface to your language with operations such as `open` `get` `set` `delete`  and more. The [Spin KV store API guide](https://developer.fermyon.com/spin/kv-store-api-guide) can be used to set and check previous question-answer pairs. Here's the code snippet in **Rust** to do this

```rust
// Checks key/value store to see if the question has already been answered. 
// If not answered, generates an answer, sets it in the KV store and returns it.
fn get_or_set_answer(question: &str) -> Result<String> {
    // Open the default key/value store
    let store = Store::open_default()?;

    match store.get(question) {
        Ok(value) => {
            let ans = std::str::from_utf8(&value)?.to_owned();
            if ans == "Ask again later." {
                let answer = answer();
                store.set(question, answer)?;
                Ok(answer.to_owned())
            } else {
                Ok(ans)
            }
        }
        Err(Error::NoSuchKey) => {
            let answer = answer();
            store.set(question, answer)?;
            Ok(answer.to_owned())
        }
        Err(error) => Err(error.into()),
    }
}
```
Here's the code in **Typescript**

```typescript
function getOrSetAnswer(question: string): string {
  let store = Kv.openDefault();
  let response = "";
  if (store.exists(question)) {
    response = decoder.decode(store.get(question));
    if (response == "Ask again later.") {
      response = answer();
      store.set(question, response);
    }
  } else {
    response = answer();
    store.set(question, response);
  }
  return response;
}
```

In both code snippets, the answer is retrieved from the key value store, or if the key does not exist, it stores both the question and reponse. There is also a separate check if the Magic 8 Ball's response to a stored question was previously "Ask me again later", in which case the 
new response is stored along with the question. The full code for the KV store can be [found here](https://github.com/fermyon/workshops/tree/main/spin/apps/05-spin-kv)

The [key value store tutorial](https://developer.fermyon.com/spin/kv-store-tutorial) is a helpful resource for a deep-dive into data persistence.

### Learning Summary

In this section you learned how to:

- [x] Persist non-relational data using Spin's default key-value store using the Spin key/value API

### Navigation

- Go back to [04 - Magic 8 Ball Frontend](04-frontend.md) if you still have questions on previous section
- Otherwise, proceed to [06 - Deploy your Magic Ball Spin Application to Fermyon Cloud](06-deploy-fermyon-cloud.md)
