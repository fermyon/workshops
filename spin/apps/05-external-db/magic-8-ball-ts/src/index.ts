import { HandleRequest, HttpRequest, HttpResponse} from "@fermyon/spin-sdk"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export const handleRequest: HandleRequest = async function(request: HttpRequest): Promise<HttpResponse> {
    let question = decoder.decode(request.body);
    let answerJson = `{\"answer\": \"${getOrSetAnswer(question)}\"}`;
    return {
      status: 200,
        headers: { "Content-Type": "application/json" },
      body: answerJson
    }
}

function getOrSetAnswer(question: string): string {
  let address = process.env["REDIS_ADDRESS"] as string;
  let response = decoder.decode(spinSdk.redis.get(address, question));
  if ( response.length == 0 || response == "Ask again later." ) {
    response = answer();
    spinSdk.redis.set(address, question, encoder.encode(response).buffer);
  }
  return response;
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
