use spin_sdk::http::{IntoResponse, Request, Response};
use spin_sdk::http_component;

/// A simple Spin HTTP component.
#[http_component]
fn handle_magic_eight_ball(_req: Request) -> anyhow::Result<impl IntoResponse> {
    let answer_json = format!("{{\"answer\": \"{}\"}}", answer());
    Ok(Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(answer_json)
        .build())
}

fn answer<'a>() -> &'a str {
    let answers = [
        "Ask again later.",
        "Absolutely!",
        "Unlikely",
        "Simply put, no",
    ];
    let idx = (answers.len() as f32 * rand::random::<f32>()) as usize;
    answers[idx]
}
