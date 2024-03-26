from spin_sdk.http import IncomingHandler, Request, Response
from spin_sdk import http
import json
import random
    
class IncomingHandler(http.IncomingHandler):
    def handle_request(self, request: Request) -> Response:
        answer_json = json.dumps({"answer": answer()})
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
    idx = random.randint(0, len(answers) - 1)
    return answers[idx]
