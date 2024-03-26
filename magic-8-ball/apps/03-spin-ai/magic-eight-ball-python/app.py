import json
from textwrap import dedent
from spin_sdk import http, llm
from spin_sdk.http import Request, Response
import json

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

def answer(question: str):
    print("Question:", question)
    prompt = dedent("""\
        <s>[INST] <<SYS>>
        You are acting as a Magic 8 Ball that predicts the answer to a questions about events now or in the future.
        Your tone should be expressive yet polite.
        Your answers should be 10 words or less.
        <</SYS>>
        {}[/INST]
    """).format(question)
    opts = llm.InferencingParams(
        max_tokens=20,
        repeat_penalty=1.5,
        repeat_penalty_last_n_token_count=20,
        temperature=0.25,
        top_k=5,
        top_p=0.25,
    )
    answer = llm.infer_with_options("llama2-chat", prompt, opts).text.strip()
    print("Answer:", answer)
    return answer
