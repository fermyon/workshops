from spin_sdk import http, llm
from spin_sdk.http import Request, Response

class IncomingHandler(http.IncomingHandler):
    def handle_request(self, request: Request) -> Response:
        opts = llm.InferencingParams(20, 1.5, 20, 0.25, 5, 0.25)
        prompt = "You are a Magic 8 Ball that predicts the answer to a question about events now or in the future. Your tone should be expressive yet polite. Your answers should be 10 words or less. Prefix your response with Answer:"
        res = llm.infer_with_options("llama2-chat", prompt, options = opts)
        return Response(
            200,
            {"content-type": "text/plain"},
            bytes(res.text, "utf-8")
        )