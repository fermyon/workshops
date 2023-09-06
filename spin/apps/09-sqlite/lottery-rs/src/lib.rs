use anyhow::Result;
use spin_sdk::{
    http::{Params, Request, Response, Router},
    http_component,
    sqlite::{Connection, ValueParam},
};

#[http_component]
fn handle_lottery(req: Request) -> Result<Response> {
    let mut router = Router::new();
    router.post("/enter", add_candidate);
    router.get("/winner", get_winner);
    router.any("/*", wildcard);
    router.handle(req)
}

pub fn add_candidate(req: Request, _params: Params) -> Result<Response> {
    let body = req.body().as_deref().unwrap_or_default();
    let name = std::str::from_utf8(body)?;
    let connection = Connection::open_default()?;
    let execute_params = [ValueParam::Text(name)];
    connection.execute(
        "INSERT INTO contestants (name) VALUES (?)",
        execute_params.as_slice(),
    )?;
    Ok(http::Response::builder()
        .status(200)
        .header("foo", "bar")
        .body(Some(format!("Entered {name}").into()))?)
}

pub fn get_winner(_req: Request, _params: Params) -> Result<Response> {
    let connection = Connection::open_default()?;
    let result = connection.execute(
        "SELECT name
        FROM contestants
        ORDER BY RANDOM()
        LIMIT 1",
        &[],
    )?;
    let winner = result
        .rows()
        .next()
        .unwrap()
        .get::<&str>("name")
        .unwrap()
        .to_owned();
    Ok(http::Response::builder()
        .status(200)
        .header("foo", "bar")
        .body(Some(winner.into()))?)
}

fn wildcard(_req: Request, _params: Params) -> Result<Response> {
    Ok(http::Response::builder()
        .status(http::StatusCode::OK)
        .body(Some(
            "Please use /enter endpoint to join lottery and /winner endpoint to draw a winner"
                .to_string()
                .into(),
        ))?)
}
