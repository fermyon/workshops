
# Extending Magic AI Ball JSON API with Spin with Fermyon Serverless AI

Instead of being limited by a set of 20 predefined responses, we can use AI inferencing to generate a unique response that is catered to our questions.

Spin now supports running inferencing requests with Language Learning Models (LLMs) with SDK support
for Rust and TS/JS apps. Furthermore, you can test your Spin app locally and then deploy it to
Cloud, which hosts its own LLM for handling inferencing.

This section will walk through how to modify your JSON API to use responses from an LLM instead of a
hard coded list.

As with the previous steps, you can choose to build the app in either Rust, Javascript/Typescript, or Go. 

> Note that Fermyon Cloud support is currently in private beta. To apply for access to the private beta, please fill out [this survey](https://fibsu0jcu2g.typeform.com/serverless-ai?utm_source=xxxxx&utm_medium=xxxxx&utm_campaign=xxxxx#hubspot_utk=xxxxx&hubspot_page_name=xxxxx&hubspot_page_url=xxxxx).

To get started with Fermyon Serverless AI, follow [these instructions](https://developer.fermyon.com/spin/serverless-ai-tutorial) to make sure you have installed the correct version of Spin and the necessary SDKs. If you'd like to learn more about the API, visit the [API guide here](https://developer.fermyon.com/spin/serverless-ai-api-guide).

## a. Building your Magic AI Ball application with Rust


We need to modify our `magic-8-ball` component to:

1. Get a yes/no question from the body of the HTTP request
2. Use the `Llm.infer` function Spin `Llm` library to generate a response to the question

First, update the request handler to get the question from the request body and return an error if
the body is empty:

```rs
fn handle_magic_8_ball(req: Request) -> Result<Response> {
    let body = req.body().as_deref().unwrap_or_default();
    let question = std::str::from_utf8(&body)?;
    if question.is_empty() {
        return Ok(http::Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .body(Some("No question provided".into()))?);
    }
    ...
```

Next, let's update the `answer` function to use the LLM instead of pulling a random response from a
list. First, get the `llm` module from the Spin Rust SDK:
```rs
use spin_sdk::llm;
```

Now, in `answer` use the `llm::infer` function, specifying which model you have configured Spin to
use and a prompt. We will use the default `Llama2Chat` model, which we will download later. The
prompt should tell the system what type of responses it should give along with the user provided
question. Your `answer` function should look similar to the following:

```rs
fn answer(question: &str) -> Result<String> {
    let prompt = format!(
        r"<<SYS>>You are acting as an omniscient Magic 8 Ball that answers users' yes or no questions.<</SYS>>
        [INST]Answer the question that follows the 'User:' prompt with a short response. Prefix your response with 'Answer:'.
        If the question is not a yes or no question, reply with 'I can only answer yes or no questions'.
        Your tone should be expressive yet polite. Always restrict your answers to 10 words or less. 
        NEVER continue a prompt by generating a user question.[/INST]
        User: {question}"
    );

    // Set model to default Llama2 or the one configured in runtime-config.toml
    let model = llm::InferencingModel::Llama2Chat;
    let answer = llm::infer(model, &prompt)?.text;
    let mut answer = answer.trim();
    while let Some(a) = answer.strip_prefix("Answer:") {
        answer = a.trim();
    }
    Ok(answer.trim().to_string())
}
```


> Note: The `llm::infer_with_options` function can be substituted to also pass in configuration to
> the LLM such as the maximum tokens that should be used in the request.

## Deploy to Cloud
Let's deploy our Serverless AI application to Fermyon Cloud with the following command: 

```bash
spin cloud deploy
```

Let's ask a question (make sure to use your Spin application's domain name, discoverable on [Fermyon Cloud UI](https://cloud.fermyon.com))

```sh
$ curl -d "Will I win the lottery?" http://magic-8-sktges.fermyon.app/magic-8
{"answer": "Signs point to yes!"}  
```

## (Optional) Run locally 

Before we run our application locally, we must first download a LLM. The following steps show how to
download Llama 2, the model used in Fermyon Cloud. This has the benefit of being a stronger model
and a consistent local to Cloud experience; however, the model is quite large (6GB). Alternatively,
you can install a smaller LLM model and configure Spin to use it with a runtime config file. The
model should be placed in the `.spin/ai-models` directory:

```sh
mkdir -p .spin/ai-models
wget https://huggingface.co/TheBloke/Llama-2-13B-chat-GGML/resolve/main/llama-2-13b-chat.ggmlv3.q3_K_L.bin
mv llama-2-13b-chat.ggmlv3.q3_K_L.bin .spin/ai-models/llama2-chat
```

Now, you can build and run your Magic AI Ball!

```sh
$ spin build --up
```

Let's ask a question

```sh
$ curl -d "Will I win the lottery?" http://127.0.0.1:3000/magic-8
{"answer": "Signs point to yes!"}  
```
> Note: the LLM model can be slow when hosted on your machine. For quicker responses, you can
> [deploy your application to Fermyon
> Cloud](https://developer.fermyon.com/cloud/quickstart#log-in-to-the-fermyon-cloud) with `spin
> deploy`.


> Note: you can find the complete applications used in this workshop in the [`apps`
> directory](./apps/).


## b. Building your Magic 8 Ball application with TypeScript

We need to modify our `magic-8-ball` component to:

1. Reference a local LLM model
1. Get a yes/no question from the body of the HTTP request
1. Use the `Llm.infer` function Spin `Llm` library to generate a response to the question


First, update the request handler to get the question from the request body and return an error if
the body is empty:

```ts
  const question = decoder.decode(request.body)
  if (question.length == 0) {
    return {
      status: 400,
      body: encoder.encode("No question asked").buffer
    }
  }
```

Next, update the `answer` function to use the LLM instead of pulling a random response from a list.
Use the `Llm.infer` function, passing in a prompt to tell the system what type of responses it
should give along with the user provided question.

```ts
function answer(question: string): string {
  const systemPrefix = "System:"
  const userPrefix = "User:"
  const intro =  `${systemPrefix} You are acting as an omniscient Magic 8 Ball, generating short responses to yes or no questions. You should be able to give an answer to everything, even if the reply is maybe or to ask again later. If the question is not a yes or no question, reply that they should only ask yes or no questions. Your tone should be expressive yet polite. Always restrict your answers to 10 words or less. NEVER continue a prompt by generating a User question.\n`;

  let prompt = intro + userPrefix + " " + question
  let response = Llm.infer(prompt).text
  // Parse the response to remove the expected `System:` prefix from the response
  let answer = response.substring(response.indexOf(systemPrefix) + systemPrefix.length).trim()
  return answer
}
```

> Note: The `Llm.InferWithOptions` function can be used to also passing in configuration to the LLM
> such as the maximum tokens that should be used in the request.

## Deploy to Cloud
Let's deploy our Serverless AI application to Fermyon Cloud with the following command: 

```bash
spin cloud deploy
```

Let's ask a question (make sure to use your Spin application's domain name, discoverable on [Fermyon Cloud UI](https://cloud.fermyon.com))

```sh
$ curl -d "Will I win the lottery?" http://magic-8-sktges.fermyon.app/magic-8
{"answer": "Signs point to yes!"}  
```

## Run Locally

Before we run our application, we must first download a LLM. The following steps show how to
download Llama 2, the model used in Fermyon Cloud. This has the benefit of being a stronger model
and a consistent local to Cloud experience; however, the model is quite large (6GB). Alternatively,
you can install a smaller LLM model and configure Spin to use it with a runtime config file. The
model should be placed in the `.spin/ai-models` directory:

```sh
mkdir -p .spin/ai-models
wget https://huggingface.co/TheBloke/Llama-2-13B-chat-GGML/resolve/main/llama-2-13b-chat.ggmlv3.q3_K_L.bin
mv llama-2-13b-chat.ggmlv3.q3_K_L.bin .spin/ai-models/llama2-chat
```

Now, you can build and run your Magic AI Ball!

```sh
$ spin build --up
```

Let's ask a question

```sh
$ curl -d "Will I win the lottery?" http://127.0.0.1:3000/magic-8
{"answer": "Signs point to yes!"}  
```
> Note: the LLM model can be slow when hosted on your machine. For quicker responses, you can
> [deploy your application to Fermyon
> Cloud](https://developer.fermyon.com/cloud/quickstart#log-in-to-the-fermyon-cloud) with `spin
> deploy`.


> Note: you can find the complete applications used in this workshop in the [`apps`
> directory](./apps/).

## Learning Summary

In this section you learned how to:

- [x] Use the Spin LLM SDK to run inferencing request from Spin applications

## Navigation

- Go back to [01 - Getting started with Spin](01-getting-started.md) if you still have questions on
  previous section
- Otherwise, proceed to [08 - Deploying a Spin Application on Kubernete](08-kubernetes.md)
