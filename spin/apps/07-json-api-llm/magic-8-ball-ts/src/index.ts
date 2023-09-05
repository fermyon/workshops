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
  const systemPrefix = "System:"
  const userPrefix = "User:"
  const intro = `${systemPrefix} You are acting as an omniscient Magic 8 Ball, generating short responses to yes or no questions. You should be able to give an answer to everything, even if the reply is maybe or to ask again later. If the question is not a yes or no question, reply that they should only ask yes or no questions. Your tone should be expressive yet polite. Always restrict your answers to 8 words or less. NEVER continue a prompt by generating a User question.\n`;

  let prompt = intro + userPrefix + " " + question
  let response = Llm.infer(InferencingModels.Llama2Chat, prompt).text
  // Parse the response to remove the expected `System:` prefix from the response
  let answer = response.substring(response.indexOf(systemPrefix) + systemPrefix.length).trim()
  return answer
}