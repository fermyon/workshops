import { ResponseBuilder, Llm } from "@fermyon/spin-sdk";

interface Answer {
    answer: String;
};

export async function handler(req: Request, res: ResponseBuilder) {
    const response: Answer = await req.text().then(data => {
        console.log(data);
        return answer(data);
    });
    console.log(response);
    res.statusCode = 200;
    res.headers.append("Content-Type", "application/json");
    res.send(JSON.stringify(response));
}

function answer(question: string): Answer {
    const prompt: string = `<s>[INST] <<SYS>>
        You are acting as a Magic 8 Ball that predicts the answer to a questions about events now or in the future.
        Your tone should be expressive yet polite.
        Your answers should be 10 words or less.
        Prefix your response with 'Answer:'.
        <</SYS>>
        User: ${question}[/INST]"`;
    let response: Answer = { answer: Llm.infer(Llm.InferencingModels.Llama2Chat, prompt, {
        maxTokens: 20,
        repeatPenalty: 1.5,
        repeatPenaltyLastNTokenCount: 20,
        temperature: 0.25,
        topK: 5,
        topP: 0.25,
    }).text};
    // Parse the response to remove the expected `Answer:` prefix from the response
    console.log(response.answer);
    const answerPrefix = "Answer:";
    response.answer = response.answer.trim();
    if (response.answer.startsWith(answerPrefix)) {
        response.answer = response.answer.substring(answerPrefix.length);
    };
    return response;
}
