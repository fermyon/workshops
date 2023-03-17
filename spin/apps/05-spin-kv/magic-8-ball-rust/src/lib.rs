use anyhow::Result;
use spin_sdk::{
    http::{Request, Response},
    http_component,
    // add the kv SDK
    key_value::{Error, Store},
};

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

// Checks key/value store to see if the question has already been answered. 
// If not answered, generates an answer, sets it in the KV store and returns it.
fn get_or_set_answer(question: &str) -> Result<String> {
    // Open the default key/value store
    let store = Store::open_default()?;

    match store.get(question) {
        Ok(value) => {
            let ans = std::str::from_utf8(&value)?.to_owned();
            if ans == "Ask again later." {
                let answer = answer();
                store.set(question, answer)?;
                Ok(answer.to_owned())
            } else {
                Ok(ans)
            }
        }
        Err(Error::NoSuchKey) => {
            let answer = answer();
            store.set(question, answer)?;
            Ok(answer.to_owned())
        }
        Err(error) => Err(error.into()),
    }
}

fn answer<'a>() -> &'a str {
    let answers:Vec<&str> = vec![
        "Ask again later.",
        "Absolutely!",
        "Unlikely",
        "Simply put, no"
      ];
    let idx = (answers.len() as f32 * rand::random::<f32>()) as usize;
    answers[idx]
}
