# Building a Magic 8 Ball JSON API with Spin

For the rest of the workshop we will build a Magic 8 Ball Spin application. With each exercise, we'll add more features to our Magic 8 Ball app. 

A [Magic 8 Ball](https://en.wikipedia.org/wiki/Magic_8_Ball) is a plastic ball that contains a 20-sided die with responses.
You vocalize your question, spin the ball, and turn the ball to see an answer revealed.

Let's build a simple JSON API using a Spin application to mimic the Magic 8 Ball experience. When requested, our Spin application should return a JSON response containing a single `answer` field with one of the following four Magic 8 Ball responses:

- "Ask again later."
- "Absolutely!"
- "Unlikely"
- "Simply put, no."

The response should be randomly selected.

As with the previous step, you can choose to build the app in either Rust or Javascript/Typescript

## a. Building your Magic 8 Ball application with Rust

We will create another Spin application in Rust based on the HTTP template. Let's name the application and our first component `magic-8-ball` and listen for requests at the path `/magic-8`.

```bash
$ spin new http-rust magic-8-ball 
Description: A Magic 8 Ball App
HTTP base: /
HTTP path: /magic-8
$ cd magic-8-ball
```

We will now write a HTTP component in our `lib.rs` file that returns Magic 8 Ball responses. Your `lib.rs` file should look like this:

```rust
use anyhow::Result;
use spin_sdk::{
    http::{Request, Response},
    http_component,
};

/// A HTTP component that returns Magic 8 Ball responses
#[http_component]
fn handle_magic_8_ball(_req: Request) -> Result<Response> {
    let answer_json = format!("{{\"answer\": \"{}\"}}", answer());
    Ok(http::Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .body(Some(answer_json.into()))?)
}

fn answer<'a>() -> &'a str {
    let answers = vec![
        "Ask again later.",
        "Absolutely!",
        "Unlikely",
        "Simply put, no"
      ];
    let idx = (answers.len() as f32 * rand::random::<f32>()) as usize;
    answers[idx]
}
```
This code snippet defines a function that can be used to handle HTTP requests for the Magic 8 Ball. The function randomly selects one of the four possible answers and returns it as a JSON string. This code snippet uses the `rand` crate. We need to add this dependancy to our `Cargo.toml` file. Your `Cargo.toml` file should look like this:

```
[package]
name = "magic-8-ball"
authors = ["Joe <Joe@example.com>"]
description = ""
version = "0.1.0"
edition = "2021"

[lib]
crate-type = [ "cdylib" ]

[dependencies]
# Useful crate to handle errors.
anyhow = "1"
# Crate to simplify working with bytes.
bytes = "1"
# General-purpose crate with common HTTP types.
http = "0.2"
rand = "0.8.5"
# The Spin SDK.
spin-sdk = { git = "https://github.com/fermyon/spin", tag = "v1.2.1" }
# Crate that generates Rust Wasm bindings from a WebAssembly interface.
wit-bindgen-rust = { git = "https://github.com/bytecodealliance/wit-bindgen", rev = "cb871cfa1ee460b51eb1d144b175b9aab9c50aba" }

[workspace]
```

That's it. We can now build the spin app using 

```bash
$ spin build
Executing the build command for component hellomagic-8-ball: cargo build --target wasm32-wasi --release
...
Successfully ran the build command for the Spin components.
```

Your Magic 8 Ball app is now running locally! Remember, we earlier had set our `HTTP path:` as  `/magic-8` so the following `curl` command will bring your Magic 8 Ball app to life! The result should look similar to the following:

```bash
$ curl http://127.0.0.1:3000/magic-8
{"answer": "Absolutely!"}%  
```

> Note: you can find the complete applications used in this workshop in the [`apps` directory](./apps/).

## b. Building your Magic 8 Ball application with TypeScript

We will create another Spin application in TypeScript based on the HTTP template. Let's name the application and our first component `magic-8-ball` and listen for requests at the path `/magic-8`.

```bash
$ spin new http-ts magic-8-ball 
Description: A Magic 8 Ball App
HTTP base: /
HTTP path: /magic-8
$ cd magic-8-ball
```

Now, follow the criteria above to bring your Magic 8 Ball JSON API to life! The result should look similar to the following:

```bash
$ curl http://127.0.0.1:3000/magic-8
{"answer": "Absolutely!"}%  
```

> Note: you can find the complete applications used in this workshop in the [`apps` directory](./apps/).

### Learning Summary

In this section you learned how to:

- [x] Host a JSON API with a Spin app which uses an HTTP trigger

### Navigation

- Go back to [01 - Getting started with Spin](01-getting-started.md) if you still have questions on previous section
- Otherwise, proceed to [03 - Magic 8 Ball Frontend](03-frontend.md)
