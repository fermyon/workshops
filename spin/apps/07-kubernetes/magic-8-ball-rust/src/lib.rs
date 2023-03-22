use anyhow::Result;
use spin_sdk::{
    http::{Request, Response},
    http_component,
};

/// A HTTP component that returns Magic 8 Ball responses
#[http_component]
fn handle_magic_8_ball(_req: Request) -> Result<Response> {
    let answer_json = format!("{{\"answer\": \"{}\"}}", answer());
    Ok(http::Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .body(Some(answer_json.into()))?)
}

fn answer<'a>() -> &'a str {
    let answers = vec![
        "Ask again later.",
        "Absolutely!",
        "Unlikely",
        "Simply put, no",
    ];
    let idx = (answers.len() as f32 * rand::random::<f32>()) as usize;
    answers[idx]
}
