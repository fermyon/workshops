import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk"

const encoder = new TextEncoder()

export async function handleRequest(request: HttpRequest): Promise<HttpResponse> {
  return {
    status: 200,
    headers: { "foo": "bar" },
    body: "Hello, WebAssembly!"
  }
}
