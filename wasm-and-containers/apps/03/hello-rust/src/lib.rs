use anyhow::Result;
use spin_sdk::{
    http::{Request, Response},
    http_component,
};

/// The entrypoint to our Spin component.
#[http_component]
fn handle_hello_rust(req: Request) -> Result<Response> {
    println!("{:?}", req.headers());
    Ok(http::Response::builder()
        .status(200)
        .header("foo", "bar")
        .body(Some("Hello, WebAssembly!".into()))?)
}
