# Using a Key Value Store with Spin

- [Using a Key Value Store with Spin](#using-a-keyvalue-store-with-spin)
  - [Implement a Counter](#implement-a-counter)
  - [Using Redis for Key Value](#using-redis-for-keyvalue)
  - [Code samples for this Section](#code-samples-for-this-section)
    - [Using TypeScript](#using-typescript)
    - [Using Rust](#using-rust)
    - [Using Go](#using-go)
    - [Using Python](#using-python)
  - [Learning Summary](#learning-summary)
  - [Navigation](#navigation)

In this module, we'll use a Key Value store to increment a counter on each request. As Spin loads a new instance of the component on each request, components have no shared memory in-between requests. Therefore we can use the Key Value store in Spin to persist data.

> **Note**
> This document assumes you have followed [the previous step](./01-spin-getting-started.md) and have a working Spin application.

> **Note**
> The section [Quick Reference for this Section](#quick-reference-for-this-section), at the end of this page, contains all the commands and code needed to complete this module, for a quick reference.

## Implement a Counter

The Spin SDK provides an easy way to use a Key Value store. Depending on the programming language you've chosen, please refer to the [Quick Reference for this Section](#quick-reference-for-this-section) to see the complete sample code. In this section we'll be using TypeScript as an example.

First we need to open a store, then check if a counter exists, and finally either set it, or increment it.

```typescript
import Kv from "@fermyon/spin-sdk"

const store = Kv.open("default");
```

When opening a store, we can provide the name of the store. This is because you can use multiple stores within your application. If we use a store named `default` (or the method `Kv.openDefault()`), we will automatically get a local sqlite implementation in our development environment, and don't have to configure what the implementation of the store is. We'll get back to this later.

Now, let's check for a counter key, and either increment or set it, and then return the counter in the body.

```typescript
import { HandleRequest, HttpRequest, HttpResponse, Kv } from "@fermyon/spin-sdk"
// Let's add an interface
interface Counter {
    count: number;
}

export const handleRequest: HandleRequest = async function(request: HttpRequest): Promise<HttpResponse> {

    // Open the KV Store named "default"
    const store = Kv.open("default");

    // Get the key "counter" or create a new instance of the interface and set count to 0
    let counter: Counter = store.getJson("counter") ?? { count: 0 };
    // Increment the counter
    counter.count++;
    // Store the instance of the counter
    store.setJson("counter", counter);

    return {
        status: 200,
        headers: { "content-type": "text/plain" },
        // Let's return the counter in the body
        body: JSON.stringify(counter)
    }
}
```

Now we need to allow the Spin component to access the Key Value store. In the `spin.toml` file, add the name of the store to the stores which will be made available for the Spin component:

```toml
[component.mycomponent]
source = "target/wasm32-wasi/release/mycomponent.wasm"
key_value_stores = ["default"]
```

Build and test the Spin application:

```bash
spin build --up

curl localhost:3000
```

You should now see the counter increment on each request.

> **Note**
> When using the "default" store locally, Spin stores the value i a sqlite file in the `.spin` directory in the root of the app directory. If you need to reset the KV store, simply delete the `sqlite_key_value.db` file in that folder.

That's it, we now have a Spin application with the ability to persist state in a Key Value store.

## Using Redis for Key Value

Moving our Spin application to any other environment, we probably want a better solution than a sqlite file to store our data. Spin provides the ability to map the Key Value store to an external provider - e.g., [Redis](https://developer.fermyon.com/spin/v2/dynamic-configuration#redis-key-value-store-provider) and [Azure Cosmos DB](https://developer.fermyon.com/spin/v2/dynamic-configuration#azure-cosmosdb-key-value-store-provider).

In order to do so, we can provide a [Runtime Configuration](https://developer.fermyon.com/spin/v2/dynamic-configuration) to our Spin application.

Let's go ahead and use a Redis container as the provider for a Key Value store in Spin. 

Let's start by running a Redis container instance, by running the following command:

```shell
# This will run the Redis image from RedisLabs, and expose Redis on port 6379 on your host.
docker run -d -p 6379:6379 --name my-redis redis
```

Next, let's provide the Runtime Configuration in a `.toml` file - e.g., `runtime-config.toml`

```toml
# We provide the name of the Key Value store in the declaration. In this case `default`
[key_value_store.default]
# The type of the KV provider: "redis", "azure_cosmos", or "spin" (sqlite)
type = "redis"
# The following depends on the provider chose, for "redis", this is the redis endpoint
url = "redis://localhost"
```

Once we have this file save, we can now run our Spin application again, providing the runtime configuration:

```bash
$ spin up --runtime-config-file runtime-config.toml
```

Hit the endpoint, and let's observe the keys being written in the Redis database:

```bash
$ curl localhost:3000

# Start the Redis CLI in the container
$ docker exec -it my-redis redis-cli
127.0.0.1:6379> GET counter
```

That's it! We now have a stateful Spin application, backed by Redis.

## Code samples for this Section

The below sections contains code samples for this section.

### Using TypeScript

```typescript
import { HandleRequest, HttpRequest, HttpResponse, Kv } from "@fermyon/spin-sdk"

interface Counter {
    count: number;
}

export const handleRequest: HandleRequest = async function(request: HttpRequest): Promise<HttpResponse> {

    const store = Kv.open("default");

    let counter: Counter = store.getJson("counter") ?? { count: 0 };
    counter.count++;
    store.setJson("counter", counter);

    return {
        status: 200,
        headers: { "content-type": "text/plain" },
        body: JSON.stringify(counter)
    }
}
```

### Using Rust

lib.rs

```rust
use spin_sdk::http::{IntoResponse, Request, Response};
use spin_sdk::http_component;
use spin_sdk::key_value;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct Counter {
    count: usize
}

/// A simple Spin HTTP component.
#[http_component]
fn handle_kv(_req: Request) -> anyhow::Result<impl IntoResponse> {
    
    let store = key_value::Store::open("redis")?;

    let count: Counter = match store.get_json::<Counter>("counter").unwrap() {
        Some(c) => {
            Counter {
                count: c.count + 1
            }
        },
        None => {
            Counter {
                count: 1
            }
        },
    };

    store.set_json::<Counter>("counter", &count).unwrap();

    Ok(Response::builder()
        .status(200)
        .header("content-type", "text/plain")
        .body(serde_json::to_string_pretty::<Counter>(&count).unwrap())
        .build())
}
```

Cargo.toml

```toml
[package]
name = "kv"
authors = ["Mikkel Mørk Hegnhøj <mikkel@fermyon.com>"]
description = ""
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
anyhow = "1"
spin-sdk = "3.0.1"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[workspace]
```

### Using Go

Source: https://github.com/rajatjindal/spin-kv-counter-go/tree/main

```golang
// Content of main.go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	spinhttp "github.com/fermyon/spin-go-sdk/http"
	kv "github.com/fermyon/spin-go-sdk/kv"
)

type Counter struct {
	Count int `json:"count"`
}

func init() {
	spinhttp.Handle(func(w http.ResponseWriter, r *http.Request) {
		store, err := kv.OpenStore("default")
		if err != nil {
			http.Error(w, "failed to open store", http.StatusInternalServerError)
			return
		}

		counter, err := getJson[Counter](store, "counter")
		if err != nil {
			http.Error(w, "failed to get counter from kv", http.StatusInternalServerError)
			return
		}

		counter.Count += 1

		updatedValue, err := setJson(store, "counter", counter)
		if err != nil {
			http.Error(w, "failed to get counter from kv", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(updatedValue)
	})
}

func main() {}

func getJson[T any](store *kv.Store, key string) (T, error) {
	var val T
	exists, err := store.Exists("counter")
	if err != nil {
		return val, err
	}

	if !exists {
		return val, nil
	}

	value, err := store.Get(key)
	if err != nil {
		return val, fmt.Errorf("failed to get value for key %q from kv store", key)
	}

	err = json.Unmarshal(value, &val)
	if err != nil {
		return val, fmt.Errorf("failed to unmarshal into struct Counter")
	}

	return val, nil
}

func setJson[T any](store *kv.Store, key string, value T) ([]byte, error) {
	updatedValue, err := json.Marshal(value)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal updated value into raw bytes")
	}

	err = store.Set(key, updatedValue)
	if err != nil {
		return nil, fmt.Errorf("failed to update value in kv")
	}

	return updatedValue, nil
}
```

go.mod

```
module github.com/go

go 1.20

require github.com/fermyon/spin-go-sdk v0.0.0-20240220234050-48ddef7a2617

require github.com/julienschmidt/httprouter v1.3.0
```

### Using Python

Source: https://github.com/rajatjindal/spin-kv-counter-py/tree/main

```python
# Content of app.py
from spin_sdk import http, key_value
from spin_sdk.http import IncomingHandler, Request, Response
import json

class Counter:
    def __init__(self, count):
        self.count = count
    
def asCounter(dct):
    return Counter(dct['count'])

class IncomingHandler(IncomingHandler):
    def handle_request(self, request: Request) -> Response:
        store = key_value.open_default()
        
        raw = store.get("counter")
        if raw is not None:
            counter: Counter = asCounter(json.loads(store.get("counter")))
        else:
            counter = Counter(0)
        
        counter.count += 1
        
        store.set("counter", bytes(json.dumps(counter.__dict__), "utf-8"))
        
        return Response(
            200,
            {"content-type": "application/json"},
            bytes(json.dumps(counter.__dict__), "utf-8")
        )
```

## Learning Summary

In this section you learned how to:

- Use the Key Value store feature in Spin
- Use Runtime configuration to change the provider of the Key Value store

## Navigation

- Go back to [1. Getting started with Spin and WebAssembly](./01-spin-getting-started.md) if you still have questions on previous section
- Otherwise, proceed to [3. Set up your local development environment for Spin WebAssembly and containers](./03-local-dev-setup-containers-wasm.md).

Let us know what you think in this short [Survey](https://fibsu0jcu2g.typeform.com/workshop).
