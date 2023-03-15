use anyhow::{anyhow, Result};
use spin_sdk::{
    http::{Request, Response},
    http_component,
    // add the redis SDK
    redis,
};

const REDIS_ADDRESS_ENV: &str = "REDIS_ADDRESS";

/// A HTTP component that returns Magic 8 Ball responses
#[http_component]
fn handle_magic_8_ball(req: Request) -> Result<Response> {
    // Get the question from the body
    let question = std::str::from_utf8(req.body().as_deref().unwrap_or(&[]))?;
    if question.is_empty() {
        return Ok(http::Response::builder()
            .status(400)
            .body(Some("Please ask a question.".into()))?);
    }

    let answer_json = format!("{{\"answer\": \"{}\"}}", get_or_set_answer(question)?);

    Ok(http::Response::builder()
        .status(200)
        .header("Content-Type", "application/json")
        .body(Some(answer_json.into()))?)
}

// Checks redis DB to see if the question has already been answered.
// If not answered, generates an answer, sets it in the database and returns it.
fn get_or_set_answer(question: &str) -> Result<String> {
    let address = std::env::var(REDIS_ADDRESS_ENV)?;
    let value =
        redis::get(&address, question).map_err(|_| anyhow!("Error executing Redis set command"))?;
    let value_str = std::str::from_utf8(&value)?;
    if value_str.is_empty() || value_str == "Ask again later." {
        let new_value = answer();
        redis::set(&address, question, new_value.as_bytes())
            .map_err(|_| anyhow!("Error executing Redis set command"))?;
        return Ok(new_value.to_string());
    }
    Ok(value_str.to_string())
}

fn answer<'a>() -> &'a str {
    let x = rand::random::<u8>();
    let fourth = u8::MAX / 4;
    if x < fourth {
        "Ask again later."
    } else if x < fourth * 2 {
        "Absolutely!"
    } else if x < fourth * 3 {
        "Unlikely"
    } else {
        "Simply put, no."
    }
}
