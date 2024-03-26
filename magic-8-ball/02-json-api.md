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

As with the previous step, you can choose to build the app in either Rust or JavaScript/TypeScript

## a. Building your Magic 8 Ball application with Rust

We will create another Spin application in Rust based on the HTTP template. Let's name the application and our first component `magic-eight-ball` and listen for requests at the path `/magic-8`.

```bash
$ spin new magic-eight-ball -t http-rust
Description: A Magic 8 Ball App
HTTP path: /magic-8
$ cd magic-eight-ball
```

We will now write a HTTP component in our `lib.rs` file that returns a Magic 8 Ball responses. Your `lib.rs` file should look like this:

```rust
use spin_sdk::http::{IntoResponse, Request, Response};
use spin_sdk::http_component;

/// A simple Spin HTTP component.
#[http_component]
fn handle_magic_eight_ball(_req: Request) -> anyhow::Result<impl IntoResponse> {
    let answer_json = format!("{{\"answer\": \"{}\"}}", answer());
    Ok(Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(answer_json)
        .build())
}

fn answer<'a>() -> &'a str {
    let answers = [
        "Ask again later.",
        "Absolutely!",
        "Unlikely",
        "Simply put, no",
    ];
    let idx = (answers.len() as f32 * rand::random::<f32>()) as usize;
    answers[idx]
}
```

This code snippet defines a function that can be used to handle HTTP requests for the Magic 8 Ball. The function randomly selects one of the four possible answers and returns it as a JSON string. This code snippet uses the `rand` crate. We need to add this dependency to our `Cargo.toml` file. Your `Cargo.toml` file should look like this:

```toml
[package]
name = "magic-eight-ball"
authors = ["Joe <Joe@example.com>"]
description = "A Magic 8 Ball App"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = [ "cdylib" ]

[dependencies]
# Useful crate to handle errors.
anyhow = "1"
# Library to get random response
rand = "0.8.5"
# The Spin SDK.
spin-sdk = "2.2.0"

[workspace]
```

That's it. We can now build and run the Spin app:

```bash
spin build --up
```

Your Magic 8 Ball app is now running locally! Remember, we earlier had set our `HTTP path:` as `/magic-8` so the following `curl` command will bring your Magic 8 Ball app to life! The result should look similar to the following:

```bash
$ curl localhost:3000/magic-8
{"answer": "Absolutely!"}%
```

> Note: you can find the complete applications used in this workshop in the [`apps` directory](./apps/).

## b. Building your Magic 8 Ball application with TypeScript

We will create another Spin application in TypeScript based on the HTTP template. Let's name the application and our first component `magic-eight-ball` and listen for requests at the path `/magic-8`.

```bash
$ spin new magic-eight-ball -t http-ts
Description: A Magic 8 Ball App
HTTP path: /magic-8
$ cd magic-eight-ball
```

We will now write a HTTP component in our `index.ts` file that returns a Magic 8 Ball responses. Your `index.ts` file should look like this:

```typescript
import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk";

const encoder = new TextEncoder();

export const handleRequest: HandleRequest = async function (
  request: HttpRequest
): Promise<HttpResponse> {
  let answerJson = `{\"answer\": \"${answer()}\"}`;
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: answerJson,
  };
};

function answer(): string {
  let answers = [
    "Ask again later.",
    "Absolutely!",
    "Unlikely",
    "Simply put, no",
  ];
  let idx = Math.floor(Math.random() * answers.length);
  return answers[idx];
}
```

This code snippet defines a function that can be used to handle HTTP requests for the Magic 8 Ball. The function randomly selects one of the four possible answers and returns it as a JSON string.

Install the dependencies and then build and run the Spin app.

```bash
npm install
spin build --up
```

> Note: `npm install` is only needed on additional builds, if you've added new dependencies to the javascript function.

Your Magic 8 Ball app is now running locally! Remember, we earlier had set our `HTTP path:` as `/magic-8` so the following `curl` command will bring your Magic 8 Ball app to life! The result should look similar to the following:

```bash
$ curl localhost:3000/magic-8
{"answer": "Absolutely!"}%
```

> Note: you can find the complete applications used in this workshop in the [`apps` directory](./apps/).

## c. Building your Magic 8 Ball application with Python

We will create another Spin application in Python based on the HTTP template. Let's name the application and our first component `magic-eight-ball` and listen for requests at the path `/magic-8`.

```bash
$ spin new magic-eight-ball -t http-py
Description: A Magic 8 Ball App
HTTP path: /magic-8
$ cd magic-eight-ball
```

We will now write a HTTP component in our `app.py` file that returns a Magic 8 Ball responses. Your `app.py` file should look like this:

```python
from spin_sdk.http import IncomingHandler, Request, Response
from spin_sdk import http
import json
import random
    
class IncomingHandler(http.IncomingHandler):
    def handle_request(self, request: Request) -> Response:
        answer_json = json.dumps({"answer": answer()})
        return Response(
            200,
            {"content-type": "application/json"},
            bytes(answer_json, "utf-8")
        )    
    
def answer():
    answers = [
        "Ask again later.",
        "Absolutely!",
        "Unlikely",
        "Simply put, no",
    ]
    idx = random.randint(0, len(answers) - 1)
    return answers[idx]
```

This code snippet defines a function that can be used to handle HTTP requests for the Magic 8 Ball. The function randomly selects one of the four possible answers and returns it as a JSON string.

Don't forget to create and activate a virtual env and the install the dependancies: 

```bash
$ python3 -m venv venv
$ source venv/bin/activate
$ pip3 install -r requirements.txt
```

Build and run the Spin app.

```bash
spin build --up
```

Your Magic 8 Ball app is now running locally! Remember, we earlier had set our `HTTP path:` as `/magic-8` so the following `curl` command will bring your Magic 8 Ball app to life! The result should look similar to the following:

```bash
$ curl localhost:3000/magic-8
{"answer": "Absolutely!"}%
```

> Note: you can find the complete applications used in this workshop in the [`apps` directory](./apps/).


## Learning Summary

In this section you learned how to:

- [x] Host a JSON API with a Spin app which uses an HTTP trigger

## Navigation

- Go back to [01 - Getting started with Spin](01-getting-started.md) if you still have questions on previous section
- Otherwise, proceed to [03 - Using Fermyon Serverless AI](03-spin-ai.md)
