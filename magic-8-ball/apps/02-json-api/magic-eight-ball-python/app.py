import json
import random
from spin_sdk import http, llm
from spin_sdk.http import Request, Response

class IncomingHandler(http.IncomingHandler):
    def handle_request(self, request: Request) -> Response:
        question=str(request.body, "utf-8")
        if not question:
            return Response(
                400,
                {"content-type": "text/plain"},
                bytes("No question provided", "utf-8")
            )
        answer_json = json.dumps({
            "answer": answer(question)
        })
        return Response(
            200,
            {"content-type": "application/json"},
            bytes(answer_json, "utf-8")
        )

def answer():
    answers = [
        "Ask again later.",
        "Absolutely!",
        "Unlikely",
        "Simply put, no",
    ]
    return random.choice(answers)
