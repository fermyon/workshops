# Enhancing the JSON API with OpenAI



Generate an API key for OpenAI at [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys) 


Instead of the preset responses from the previous example, we will generate a response using the OpenAI chat completion API by sending a request to `https://api.openai.com/v1/chat/completions`


### Note


- A system prompt has been added to restrict the response to five words or less.

### References

- [Sending Outbound HTTP Requests](https://developer.fermyon.com/spin/javascript-components#sending-outbound-http-requests)

- [Create chat completion](https://platform.openai.com/docs/api-reference/chat/create)