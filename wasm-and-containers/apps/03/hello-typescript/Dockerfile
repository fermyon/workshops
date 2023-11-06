FROM scratch AS build
WORKDIR /Users/kagold/Programs/kc-eu-2023-k8s-wasm-microservices/apps/03/hello-typescript
COPY . .

FROM scratch
COPY --from=build /Users/kagold/Programs/kc-eu-2023-k8s-wasm-microservices/apps/03/hello-typescript/spin.toml .
COPY --from=build /Users/kagold/Programs/kc-eu-2023-k8s-wasm-microservices/apps/03/hello-typescript/target/spin-http-js.wasm ./target/spin-http-js.wasm
