import { HandleRequest, HttpRequest, HttpResponse, Config } from "@fermyon/spin-sdk"


const encoder = new TextEncoder()
const decoder = new TextDecoder("utf-8")

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
  const question = decoder.decode(request.body)
  if (question.length == 0) {
    return {
      status: 400,
      body: encoder.encode("No question asked").buffer
    }
  }

  return await answer(question)
}

async function answer(question: string): Promise<HttpResponse> {
  let openaiKey = Config.get("openai_key");
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const requestData = JSON.stringify({
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": `<<SYS>>You are acting as an omniscient Magic 8 Ball that answers users' yes or no questions.<</SYS>>
        [INST]Answer the question that follows the 'User:' prompt with a short response. Prefix your response with 'Answer:'.
        If the question is not a yes or no question, reply with 'I can only answer yes or no questions'.
        Your tone should be expressive yet polite. Always restrict your answers to 10 words or less. 
        NEVER continue a prompt by generating a user question.[/INST]`
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
      'Authorization': `Bearer ${openaiKey}`
    },
    body: requestData
  };

  let response = await fetch(apiUrl, options)
  let decoded = decoder.decode(await response.arrayBuffer() || new Uint8Array())
  let parsed = JSON.parse(decoded)

  if (parsed?.error != undefined) {
    console.log(parsed?.error)
    return {
      status: 500,
      body: encoder.encode(parsed?.error.message).buffer
    }
  } else if (parsed.choices != undefined && parsed?.choices[0]?.message) {
    let response = parsed.choices[0].message.content
    response = JSON.stringify(response).trim()

    const answerPrefix = "Answer:"
    if (response.startsWith(answerPrefix)) {
      response = response.substring(answerPrefix.length)
    }
    let answerJson = `{\"answer\": \"${response}\"}`;

    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: answerJson
    }
  }

  return {
    status: 500,
    body: encoder.encode(parsed).buffer
  }

}
