# Storing data in an external database

Instead of using Spin's built in SQLite key/value store, you could use an external key/value store such as Redis.

## Rust

Follow the Spin [redis documentation](https://developer.fermyon.com/cloud/data-redis.md#redis) to instead persists questions and answers in Redis using a free database from RedisLabs.

## TypeScript

Follow the Spin [redis documentation](https://developer.fermyon.com/cloud/data-redis.md#redis) to instead persists questions and answers in Redis using a free database from RedisLabs. Reference the Spin [`examples` repository](https://github.com/fermyon/spin-js-sdk/tree/main/examples/typescript/outbound_redis) for an example TypeScript application that does outbound Redis requests.

### Navigation
* Go back to [04 - Using the Spin Key/Value store to save responses](04-spin-kv.md) if you still have questions on previous section
* Otherwise, proceed to [06 - Deploy your Magic Ball Spin Application to Fermyon Cloud](06-deploy-fermyon-cloud.md)