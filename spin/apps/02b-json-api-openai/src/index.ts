import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk"

const OPENAI_KEY = "YOUR_OPENAI_KEY"

const encoder = new TextEncoder()
const decoder = new TextDecoder("utf-8")

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

  const question = decoder.decode(request.body)

  console.log("<------->")
  console.log("Question Received: " + question)

  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const requestData = JSON.stringify({
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "Always restrict your answers to 5 words or less."
      },
      {
        "role": "user",
        "content": "" + question
      }
    ],
    "temperature": 1,
    "top_p": 1,
    "n": 1,
    "stream": false,
    "max_tokens": 250,
    "presence_penalty": 0,
    "frequency_penalty": 0
  });

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`  // Replace with your actual API token
    },
    body: requestData
  };


  let response = await fetch(apiUrl, options)
  let decoded = decoder.decode(await response.arrayBuffer() || new Uint8Array())
  let parsed = JSON.parse(decoded)

  if (parsed?.choices[0]?.message) {

    console.log("Generated Answer: " + JSON.stringify(parsed.choices[0].message.content))

    let answerJson = `{\"answer\": \"${parsed.choices[0].message.content}\"}`;

    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: answerJson
    }
  }

  return {
    status: 500,
    body: encoder.encode("Something went wrong").buffer
  }

}
