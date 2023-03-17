# Building a Magic 8 Ball JSON API with Spin

For the rest of the workshop we will build a Magic 8 Ball Spin application. Adding more features to our Magic 8 Ball with each exercise.Soon you will have all your questions answered!

A [Magic 8 Ball](https://en.wikipedia.org/wiki/Magic_8_Ball) is a plastic ball that contains a 20-sided die with responses.
You vocalize your question, spin the ball, and turn the ball to see an answer revealed.

Let's build a simple JSON API using a Spin application to mimic the Magic 8 Ball experience. When requested, our Spin application should return a JSON response containing a single `answer` field with one of the following four Magic 8 Ball responses:

- "Ask again later."
- "Absolutely!"
- "Unlikely"
- "Simply put, no."

The response should be randomly selected.

## Building your Magic 8 Ball application with Rust

We will create another Spin application in Rust based on the HTTP template. Let's name the application and our first component `magic-8-ball` and listen for requests at the path `/magic-8`.

```bash
$ spin new http-rust magic-8-ball 
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

## Building your Magic 8 Ball application with TypeScript

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

## Building your Magic 8 Ball application with Python

TODO
