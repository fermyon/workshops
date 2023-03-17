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
  let store = spinSdk.kv.openDefault();
  let response = "";
  if (store.exists(question)) {
    response = decoder.decode(store.get(question));
    if (response == "Ask again later.") {
      response = answer();
      store.set(question, response);
    }
  } else {
    response = answer();
    store.set(question, response);
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
