use anyhow::Result;
use spin_sdk::{
    http::{Request, Response},
    http_component,
    llm
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
    let answer_json = format!("{{\"answer\": \"{}\"}}", answer(question)?);
    Ok(http::Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .body(Some(answer_json.into()))?)
}

fn answer<'a>(question: &'a str) -> Result<String> {
    let system_prefix = "System:";
    let user_prefix = "User:";
    let intro =  format!("{system_prefix} You are acting as an omniscient Magic 8 Ball, generating short responses to yes or no questions. You should be able to give an answer to everything, even if the reply is maybe or to ask again later. If the question is not a yes or no question, reply that they should only ask yes or no questions. Your tone should be expressive yet polite. Always restrict your answers to 10 words or less. NEVER continue a prompt by generating a User question.\n");
  
    let prompt = intro + user_prefix + " " + question;
    // Set model to default Llama2 or the one configured in runtime-config.toml
    let model = llm::InferencingModel::Llama2Chat;
    let response = llm::infer(model, &prompt)?.text;
    let answer = response[system_prefix.len()..].trim();
    Ok(answer.to_string())
}