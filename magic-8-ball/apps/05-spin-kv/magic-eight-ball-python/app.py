from spin_sdk import http, llm, key_value
from spin_sdk.http import Request, Response
import json

class IncomingHandler(http.IncomingHandler):
    def handle_request(self, request: Request) -> Response:
            question = request.body.decode('utf-8')
            print(request.body)
            if len(question) == 0:
                return Response(
                    status= 400,
                    headers= { "Content-Type": "application/json" },
                    body= b"No question asked"
                )

            answer_json = json.dumps({"answer": getOrSetAnswer(question)})
            return Response(
                status= 200,
                headers= { "Content-Type": "application/json" },
                body= answer_json.encode('utf-8'),
            )
        
def getOrSetAnswer(question):
    store = key_value.open_default()
    response = ""
    if store.exists(question):
        response = (store.get(question)).decode('utf-8')
    else:
        response = answer(question)
        store.set(question, response.encode('utf-8'))
    return response
                
    
def answer(question):
    print(f"Question: {question}")
    
    prompt = f"<s>[INST] <<SYS>>\n\
        You are acting as a Magic 8 Ball that predicts the answer to a questions about events now or in the future.\n\
        Your tone should be expressive yet polite.\n\
        Your answers should be 10 words or less.\n\
        <</SYS>>\n\
        {question}[/INST]"
    
    opts = llm.InferencingParams(20, 1.5, 20, 0.25, 5, 0.25)
    res = llm.infer_with_options("llama2-chat", prompt, options = opts).text
    
    print(f"{res}")
    return res