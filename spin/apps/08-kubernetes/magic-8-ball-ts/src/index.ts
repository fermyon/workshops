import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk"

const encoder = new TextEncoder()

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
  let answerJson = `{\"answer\": \"${answer()}\"}`;
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: answerJson
  }
}

function answer(): string {
  let answers = [
    'Ask again later.',
    'Absolutely!',
    'Unlikely',
    'Simply put, no'
  ];
  let idx = Math.floor(Math.random() * answers.length);
  return answers[idx];
}
