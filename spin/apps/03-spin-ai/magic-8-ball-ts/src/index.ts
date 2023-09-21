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
	const prompt = `<s>[INST] <<SYS>>
        You are acting as a Magic 8 Ball that predicts the answer to a questions about events now or in the future.
        Your tone should be expressive yet polite.
        Your answers should be 10 words or less.
        Prefix your response with 'Answer:'.
        <</SYS>>
        ${question}[/INST]`
  let response = Llm.infer(InferencingModels.Llama2Chat, prompt, {
	  maxTokens: 20,
	  repeatPenalty: 1.5,
	  repeatPenaltyLastNTokenCount: 20,
	  temperature: 0.25,
	  topK: 5,
	  topP: 0.25,
	}).text
  // Parse the response to remove the expected `Answer:` prefix from the response
  const answerPrefix = "Answer:"
  response = response.trim()
  if(response.startsWith(answerPrefix)) {
    response = response.substring(answerPrefix.length)
  }
  return response
}
