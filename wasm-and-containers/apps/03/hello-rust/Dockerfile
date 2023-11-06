FROM scratch AS build
WORKDIR /Users/kagold/Programs/kc-eu-2023-k8s-wasm-microservices/apps/03/hello-rust
COPY . .

FROM scratch
COPY --from=build /Users/kagold/Programs/kc-eu-2023-k8s-wasm-microservices/apps/03/hello-rust/spin.toml .
COPY --from=build /Users/kagold/Programs/kc-eu-2023-k8s-wasm-microservices/apps/03/hello-rust/target/wasm32-wasi/release/hello_rust.wasm ./target/wasm32-wasi/release/hello_rust.wasm
