import { ResponseBuilder } from "@fermyon/spin-sdk";

interface Answer {
    answer: String;
};

export async function handler(req: Request, res: ResponseBuilder) {
    res.statusCode = 200;
    res.headers.append("Content-Type", "application/json");
    res.send(JSON.stringify(answer()));
}

function answer(): Answer {
  let answers = [
    "Ask again later.",
    "Absolutely!",
    "Unlikely",
    "Simply put, no",
  ];
  let idx = Math.floor(Math.random() * answers.length);
  return { answer: answers[idx] };
}

