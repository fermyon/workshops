# Creating a Magic AIght Ball JSON API with Spin with Fermyon Serverless AI

Instead of being limited by a set of 20 predefined responses, we can use AI inferencing to generate a unique response that is catered to our questions.

Spin now supports running inferencing requests with Language Learning Models (LLMs) with SDK support
for Rust and TS/JS apps. Furthermore, you can test your Spin app locally and then deploy it to
Cloud, which hosts its own LLM for handling inferencing.

This section will walk through how to modify your JSON API to use responses from an LLM instead of a
hard coded list.

As with the previous steps, you can choose to build the app in either Rust or JavaScript/TypeScript.

If you'd like to learn more about the API, visit the [API guide here](https://developer.fermyon.com/spin/serverless-ai-api-guide).

## a. Building your Magic AI Ball application with Rust

We need to modify our `magic-eight-ball` component to:

1. Get a yes/no question from the body of the HTTP request
2. Use the `Llm.infer_with_options` function Spin `Llm` library to generate a response to the question

First, update the request handler to get the question from the request body and return an error if
the body is empty:

```rs
#[http_component]
fn handle_magic_eight_ball(req: Request) -> anyhow::Result<impl IntoResponse> {
    let body = req.body();
    let question = std::str::from_utf8(&body)?;
    if question.is_empty() {
        return Ok(Response::builder()
            .status(200)
            .header("Content-Type", "application/json")
            .body("No question provided")
            .build());
    }
    let answer_json = format!(r#"{{"answer": "{}"}}"#, answer(question.to_string())?);
    Ok(Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .body(answer_json)
        .build())
}
```

Next, let's update the `answer` function to use the LLM instead of pulling a random response from a list. In your application (`lib.rs`), you can get the `llm` module from the Spin Rust SDK:

```rs
use spin_sdk::llm;
```

Update the `answer` function to use the `llm::infer_with_options` function, specifying which model you have configured Spin to
use and a prompt. We will use the default `Llama2Chat` model, which you can download later or use in Fermyon Cloud. The
prompt should tell the system what type of responses it should give along with the user provided
question. Your `answer` function should look similar to the following:

```rs
fn answer(question: &str) -> Result<String> {
    let prompt = format!(
        r"<s>[INST] <<SYS>>
        You are acting as a Magic 8 Ball that predicts the answer to a questions about events now or in the future.
        Your tone should be expressive yet polite.
        Your answers should be 10 words or less.
        Prefix your response with 'Answer:'.
        <</SYS>>
        {question}[/INST]"
    );

    // Set model to default Llama2 or the one configured in runtime-config.toml
    let model = llm::InferencingModel::Llama2Chat;
    let answer = llm::infer_with_options(
        model,
        &prompt,
        llm::InferencingParams {
            max_tokens: 20,
            repeat_penalty: 1.5,
            repeat_penalty_last_n_token_count: 20,
            temperature: 0.25,
            top_k: 5,
            top_p: 0.25,
        },
    )?
    .text;
    let mut answer = answer.trim();
    while let Some(a) = answer.strip_prefix("Answer:") {
        answer = a.trim();
    }
    Ok(answer.trim().to_string())
}
```

> Note: The `llm::infer` function can be used in the request if you want to use the default options.

Now, build your application and see the [deploy to Fermyon Cloud section](#deploy-to-cloud) to test it out.

```bash
spin build
```

## b. Building your Magic 8 Ball application with TypeScript

We need to modify our `magic-eight-ball` component to:

1. Reference a local LLM model
1. Get a yes/no question from the body of the HTTP request
1. Use the `Llm.infer` function Spin `Llm` library to generate a response to the question

First, create a `TextDecoder` at the top level:

```ts
const decoder = new TextDecoder();
```

Then, update the `handleRequest` function to get the question from the request body and return an error if
the body is empty:

```ts
const question = decoder.decode(request.body);
if (question.length == 0) {
  return {
    status: 400,
    body: encoder.encode("No question asked").buffer,
  };
}
```

Next, update the `answer` function to use the LLM instead of pulling a random response from a list.
Use the `Llm.infer` function, passing in a prompt to tell the system what type of responses it
should give along with the user provided question.

```ts
function answer(question: string): string {
  const prompt = `<s>[INST] <<SYS>>
        You are acting as a Magic 8 Ball that predicts the answer to a questions about events now or in the future.
        Your tone should be expressive yet polite.
        Your answers should be 10 words or less.
        Prefix your response with 'Answer:'.
        <</SYS>>
        User: ${question}[/INST]"`;
  let response = Llm.infer(InferencingModels.Llama2Chat, prompt, {
    maxTokens: 20,
    repeatPenalty: 1.5,
    repeatPenaltyLastNTokenCount: 20,
    temperature: 0.25,
    topK: 5,
    topP: 0.25,
  }).text;
  // Parse the response to remove the expected `Answer:` prefix from the response
  const answerPrefix = "Answer:";
  response = response.trim();
  if (response.startsWith(answerPrefix)) {
    response = response.substring(answerPrefix.length);
  }
  return response;
}
```

Now, build your application.

```bash
npm install
spin build
```

## Configure access to an AI model

By default, a given component of a Spin application will not have access to any Serverless AI models. Access must be provided explicitly via the Spin application’s manifest (the `spin.toml` file). We can give our `magic-8` component access to the llama2-chat model by adding the following ai_models configuration inside its `[[component]]` section:

```toml
[[component]]
id = "magic-8-ball"
ai_models = ["llama2-chat"]
```

## c. Building your Magic 8 Ball application with Python

We need to modify our `magic-eight-ball` component to:

1. Reference a local LLM model
1. Get a yes/no question from the body of the HTTP request
1. Use the `Llm.infer` function Spin `Llm` library to generate a response to the question


First, update the `handle_request` function to get the question from the request body and return an error if
the body is empty:

```python
class IncomingHandler(http.IncomingHandler):
    def handle_request(self, request: Request) -> Response:
        question = request.body.decode('utf-8')
        if len(question) == 0:
            return Response(
                status= 400,
                headers= { "Content-Type": "application/json" },
                body= b"No question asked"
            )
```

Next, update the `answer` function to use the LLM instead of pulling a random response from a list.
Use the `Llm.infer` function, passing in a prompt to tell the system what type of responses it
should give along with the user provided question. You can play along with the `InferencingParams` to see how responses from the LLM may differ. For reference, here are the parameters used in order: 
`{
    maxTokens: 20,
    repeatPenalty: 1.5,
    repeatPenaltyLastNTokenCount: 20,
    temperature: 0.25,
    topK: 5,
    topP: 0.25,
  }`

```python
def answer(question):
    prompt = f"<s>[INST] <<SYS>>\n\
        You are acting as a Magic 8 Ball that predicts the answer to a questions about events now or in the future.\n\
        Your tone should be expressive yet polite.\n\
        Your answers should be 10 words or less.\n\
        <</SYS>>\n\
        {question}[/INST]"
    
    opts = llm.InferencingParams(20, 1.5, 20, 0.25, 5, 0.25)
    res = llm.infer_with_options("llama2-chat", prompt, options = opts).text
    
    print(f"{res}")
    return res
```

Now, build your application.

```bash
$ spin build
```

## Configure access to an AI model

By default, a given component of a Spin application will not have access to any Serverless AI models. Access must be provided explicitly via the Spin application’s manifest (the `spin.toml` file). We can give our `magic-8` component access to the llama2-chat model by adding the following ai_models configuration inside its `[[component]]` section:

```toml
[[component]]
id = "magic-8-ball"
ai_models = ["llama2-chat"]
```

## Deploy to Cloud

Let's deploy our Serverless AI application to Fermyon Cloud with the following command:

```bash
spin cloud deploy
```

> Note: If this is the first time you interact with the cloud, you will be asked to [sign up using GitHub](https://developer.fermyon.com/cloud/quickstart#log-in-to-the-fermyon-cloud).

Let's ask a question (make sure to use your Spin application's domain name, discoverable on [Fermyon Cloud UI](https://cloud.fermyon.com))

```bash
$ curl -d "Will I win the lottery?" https://{url}/magic-8
{"answer": "Signs point to yes!"}
```

## (Optional) Run Locally

We can run the inferencing requests locally, but the model needed is a large download, and the inferencing takes a long time to run. We should expect tens of seconds for each request.

Before we run our application locally, we must first download a LLM. The following steps show how to
download Llama 2, the model used in Fermyon Cloud. This has the benefit of being a stronger model
and a consistent local to Cloud experience; however, the model is quite large (6GB). Alternatively,
you can install a smaller LLM model and configure Spin to use it with a runtime config file. The
model should be placed in the `.spin/ai-models` directory:

```bash
mkdir -p .spin/ai-models
wget https://huggingface.co/TheBloke/Llama-2-13B-chat-GGML/resolve/main/llama-2-13b-chat.ggmlv3.q3_K_L.bin
mv llama-2-13b-chat.ggmlv3.q3_K_L.bin .spin/ai-models/llama2-chat
```

Now, we can build and run your Magic AI Ball!

```bash
spin build --up
```

Let's ask a question

```bash
$ curl -d "Will I win the lottery?" http://127.0.0.1:3000/magic-8
{"answer": "Signs point to yes!"}
```

> Note: you can find the complete applications used in this workshop in the [`apps`
> directory](./apps/).

## (Optional) Using the Cloud-GPU plugin to test locally
 
To avoid having to cloud-deploy the app for every change or use a large model on your local machine, you can use the [Cloud-GPU plugin](https://github.com/fermyon/spin-cloud-gpu) to deploy locally, with the LLM running in the cloud. While the app is hosted locally (running on `localhost`), every inferencing request is sent to the LLM that is running in the cloud. Follow the steps to use the `cloud-gpu` plugin.
 
First, install the plugin using the command:
 
```bash
$ spin plugins install -u https://github.com/fermyon/spin-cloud-gpu/releases/download/canary/cloud-gpu.json -y
```
 
Let’s initialize the plugin. This command essentially deploys the Spin app to a Cloud GPU proxy and generates a runtime-config:
 
```bash
$ spin cloud-gpu init

[llm_compute]
type = "remote_http"
url = "https://fermyon-cloud-gpu-<AUTO_GENERATED_STRING>.fermyon.app"
auth_token = "<AUTO_GENERATED_TOKEN>"
```
 
In the root of your Spin app directory, create a file named `runtime-config.toml` and paste the runtime-config generated in the previous step.
 
Now you are ready to test the Serverless AI app locally, using a GPU that is running in the cloud. To deploy the app locally you can use `spin up` but with the following flag:
 
```bash
$ spin up --runtime-config-file <path/to/runtime-config.toml>

Logging component stdio to  ".spin/logs/"
Serving http://127.0.0.1:3000
Available Routes:
hello-world: http://127.0.0.1:3000 (wildcard)
```

## Learning Summary

In this section you learned how to:

- [x] Use the Spin LLM SDK to run inferencing request from Spin applications

## Navigation

- Go back to [02 - Building a Magic 8 Ball JSON API with Spin](02-json-api.md) if you still have questions on previous section
- Otherwise, proceed to [04 - Magic 8 Ball Frontend](04-frontend.md)
