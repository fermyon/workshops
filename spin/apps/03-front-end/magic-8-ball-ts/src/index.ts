import { HandleRequest, HttpRequest, HttpResponse} from "@fermyon/spin-sdk"

const encoder = new TextEncoder()

export const handleRequest: HandleRequest = async function(request: HttpRequest): Promise<HttpResponse> {
    let answerJson = `{\"answer\": \"${answer()}\"}`;
    return {
      status: 200,
        headers: { "Content-Type": "application/json" },
      body: encoder.encode(answerJson).buffer
    }
}

function answer(): string {
  let rand = Math.random();
  if ( rand < 0.25 ) {
    return "Ask again later."
  } else if ( rand < 0.50 ) {
    return "Absolutely!"
  } else if ( rand < 0.75 ) {
    return "Unlikely"
  } else {
    return "Simply put, no."
  }
}
