from spin_sdk.http import IncomingHandler, Request, Response

class IncomingHandler(IncomingHandler):
    def handle_request(self, request: Request) -> Response:
        return Response(
            200,
            {"content-type": "text/plain"},
            bytes("Hello, WebAssembly", "utf-8")
        )
