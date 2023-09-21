use anyhow::Result;
use spin_sdk::{
    http::{Request, Response},
    http_component, llm,
};

/// A HTTP component that returns Magic 8 Ball responses
#[http_component]
fn handle_magic_8_ball(req: Request) -> Result<Response> {
    let body = req.body().as_deref().unwrap_or_default();
    let question = std::str::from_utf8(&body)?;
    if question.is_empty() {
        return Ok(http::Response::builder()
            .status(200)
            .header("Content-Type", "application/json")
            .body(Some("No question provided".into()))?);
    }
    let answer_json = format!(r#"{{"answer": "{}"}}"#, answer(question.to_string())?);
    Ok(http::Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .body(Some(answer_json.into()))?)
}

fn answer(mut question: String) -> Result<String> {
    if &question[question.len() - 1..] != "?" {
        question.push('?');
    }
    println!("Question: {:?}", question);
    let prompt = format!(
        r"<s>[INST] <<SYS>>
        You are acting as a Magic 8 Ball that predicts the answer to a questions about events now or in the future.
        Your tone should be expressive yet polite.
        Your answers should be 10 words or less.
        Prefix your response with 'Answer:'.
        <</SYS>>
        {question}[/INST]"
    );
    // Set model to default Llama2 or the one configured in runtime-config.toml
    let model = llm::InferencingModel::Llama2Chat;
    let answer = llm::infer_with_options(
        model,
        &prompt,
        llm::InferencingParams {
            max_tokens: 20,
            repeat_penalty: 1.5,
            repeat_penalty_last_n_token_count: 20,
            temperature: 0.25,
            top_k: 5,
            top_p: 0.25,
        },
    )?
    .text;
    let mut answer = answer.trim();
    while let Some(a) = answer.strip_prefix("Answer:") {
        answer = a.trim();
    }
    println!("Answer: {:?}", answer);
    Ok(answer.trim().to_string())
}
