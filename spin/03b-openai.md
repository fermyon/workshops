# Creating a Magic AIght Ball JSON API with Spin with OpenAI

Instead of using [Spin's built in support for LLM models](03-spin-ai.md), our Magic 8 ball can also be transformed into a Magic AIght ball using OpenAI.

## Getting setup with OpenAI

First, generate an API key for OpenAI at [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys).

Instead of the preset responses from the previous example, we will generate a response using the OpenAI chat completion API by sending a request to `https://api.openai.com/v1/chat/completions`.

## Implementation

Similar to the [Spin AI example](./03-spin-ai.md), create an `answer` function that queries OpenAI's completions endpoint with the following prompt:

```ts
`<<SYS>>You are acting as an omniscient Magic 8 Ball that answers users' yes or no questions.<</SYS>>
[INST]Answer the question that follows the 'User:' prompt with a short response. Prefix your response with 'Answer:'.
If the question is not a yes or no question, reply with 'I can only answer yes or no questions'.
Your tone should be expressive yet polite. Always restrict your answers to 10 words or less. 
NEVER continue a prompt by generating a user question.[/INST]`
```

Then parse the response for the answer and handle any errors, such as ones due to exceeding OpenAI quotas.

An example can be found in [apps/03b-openai](./apps/03b-openai/).

## Running the Application with a Provided API Key

The example gets the OpenAI key from a Spin configuration variable. Pass the value of the key to Spin in an environment variable prefixed with `SPIN_CONFIG`. Spin's environment variable provider with parse the local process environment for these variables and expose them through the Spin config SDK.

```sh
$ SPIN_CONFIG_OPENAI_KEY=$YOUR_OPENAI_KEY spin build --up
Serving http://127.0.0.1:3000
Available Routes:
  magic-8-ball: http://127.0.0.1:3000/magic-8
```

Now ask your question in the body of the request:

```sh
$ curl -d "Will I get a pet tortoise?" http://127.0.0.1:3000/magic-8
{"answer": "Outlook is uncertain."}
```

### References

- [Sending Outbound HTTP Requests](https://developer.fermyon.com/spin/javascript-components#sending-outbound-http-requests)
- [Create chat completion](https://platform.openai.com/docs/api-reference/chat/create)