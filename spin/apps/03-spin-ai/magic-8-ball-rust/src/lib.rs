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
    let answer_json = format!(r#"{{"answer": "{}"}}"#, answer(question)?);
    Ok(http::Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .body(Some(answer_json.into()))?)
}

fn answer(question: &str) -> Result<String> {
    let prompt = format!(
        r"<<SYS>>You are acting as an omniscient Magic 8 Ball that answers users' yes or no questions.<</SYS>>
        [INST]Answer the question that follows the 'User:' prompt with a short response. Prefix your response with 'Answer:'.
        If the question is not a yes or no question, reply with 'I can only answer yes or no questions'.
        Your tone should be expressive yet polite. Always restrict your answers to 10 words or less. 
        NEVER continue a prompt by generating a user question.[/INST]
        User: {question}"
    );

    // Set model to default Llama2 or the one configured in runtime-config.toml
    let model = llm::InferencingModel::Llama2Chat;
    let answer = llm::infer(model, &prompt)?.text;
    let mut answer = answer.trim();
    while let Some(a) = answer.strip_prefix("Answer:") {
        answer = a.trim();
    }
    Ok(answer.trim().to_string())
}
