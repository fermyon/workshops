## Potentially using Docker Compose and Redis

```toml
[key_value_store.default]
type = "redis"
url = "redis://redis"
```

```toml
spin_manifest_version = "1"
authors = ["Mikkel Mørk Hegnhøj <mikkel@fermyon.com>"]
description = ""
name = "my-application"
trigger = { type = "http", base = "/" }
version = "0.1.0"

[[component]]
id = "my-application"
source = "target/my-application.wasm"
key_value_stores = ["default"]
exclude_files = ["**/node_modules"]
[component.trigger]
route = "/..."
[component.build]
command = "npm run build"
```

```typescript
import { Kv,HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk"

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
  const store = Kv.openDefault()
  let currentCount
  if (store.exists("count")) {
  	currentCount = store.getJson("count")
  } else {
	currentCount = 0
  }

  store.setJson("count", ++currentCount)
  store.setJson("Hello", "KubeCon")

  let response = store.getJson("Hello")

  return {
    status: 200,
    headers: { "foo": "bar" },
    body: `${response} ${currentCount}`
    //body: "Hello from TS-SDK"
  }
}
```

```yaml
services:
  web:
    image: "ghcr.io/mikkelhegn/my-application:latest"
    ports:
      - "3000:80"
    platform: "wasi/wasm"
    runtime: "io.containerd.spin.v1"
  redis:
    image: "redis:alpine"
```

```bash
$ spin build
$ docker build
$ compose up
```


# Building more complex Spin applications

TODO - Make part of 01 section

You can now go beyond a simple Wasm "Hello, World" application and build a [Magic 8 Ball](https://github.com/fermyon/workshops/blob/main/spin/02-json-api.md) Spin application that has a JSON API, front end, and key value store. Follow the Spin workshop to find all your questions answered by your very own Magic 8 Ball!