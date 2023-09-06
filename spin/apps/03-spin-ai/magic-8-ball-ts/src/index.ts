import { HandleRequest, HttpRequest, HttpResponse, Llm, InferencingModels } from "@fermyon/spin-sdk"

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

  let answerJson = `{\"answer\": \"${answer(question)}\"}`;
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: answerJson
  }
}

function answer(question: string): string {
  const prompt =  `<<SYS>>You are acting as an omniscient Magic 8 Ball that answers users' yes or no questions.<</SYS>>
  [INST]Answer the question that follows the 'User:' prompt with a short response. Prefix your response with 'Answer:'.
  If the question is not a yes or no question, reply with 'I can only answer yes or no questions'.
  Your tone should be expressive yet polite. Always restrict your answers to 10 words or less. 
  NEVER continue a prompt by generating a user question.[/INST]
  User: ${question}"`;
  let response = Llm.infer(InferencingModels.Llama2Chat,prompt).text
  // Parse the response to remove the expected `Answer:` prefix from the response
  const answerPrefix = "Answer:"
  response = response.trim()
  if(response.startsWith(answerPrefix)) {
    response = response.substring(answerPrefix.length)
  }
  return response
}