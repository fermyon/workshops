# The goal of this Dockerfile is to be architecture independent. To that end,
# it avoids downloading any platform-specific binaries, and installs the required
# tools either through Debian's package manager, or through installation scripts
# that download the appropriate binaries.

# If the examples in this repository require it, update this Dockerfile to install
# more language toolchains (such as .NET or TinyGo).

FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    bash                                 \
    git                                  \
    curl                                 \
    nodejs                               \
    npm                                  \
    golang-go                            \
    build-essential libssl-dev pkg-config\
    glibc-source                         \
    ca-certificates

# Install Rust
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup target add wasm32-wasi

# Install the gopls Go Language Server, see https://github.com/golang/tools/tree/master/gopls
RUN go install golang.org/x/tools/gopls@latest

# Install Spin and required plugins
RUN (curl -fsSL https://developer.fermyon.com/downloads/install.sh | bash && mv spin /usr/local/bin/) &&    \
    spin plugin install js2wasm -y &&                                                                       \
    spin templates install --git https://github.com/fermyon/spin --update &&                                \
    spin templates install --git https://github.com/fermyon/spin-js-sdk --update &&                         \
    spin templates install --git https://github.com/radu-matei/spin-kv-explorer --update &&                 \
    spin templates install --git https://github.com/radu-matei/spin-nextjs --update
