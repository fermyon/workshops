# Storing key/value data in an external database

Instead of using Spin's built in key/value store, you could use an external key/value store such as Redis. This section is intended as a learning exercise for the user. The complete code can be [found here](https://github.com/fermyon/workshops/tree/main/magic-8-ball/apps/07-external-db)

## Rust

Follow the Spin [Redis documentation](https://developer.fermyon.com/cloud/data-redis.md#redis) to persist questions & answers using a free database from RedisLabs.

## TypeScript

Follow the Spin [Redis documentation](https://developer.fermyon.com/cloud/data-redis.md#redis) to persist questions & answers using a free database from RedisLabs. Reference the Spin [`examples` repository](https://github.com/fermyon/spin-js-sdk/tree/main/examples/typescript/outbound_redis) for an example TypeScript application that does outbound Redis requests.

## Python

Follow the Spin [Redis documentation](https://developer.fermyon.com/cloud/data-redis.md#redis) to persist questions & answers using a free database from RedisLabs. Reference the Spin [`examples` repository](https://github.com/fermyon/spin-python-sdk/tree/main/examples/spin-redis) for a Python example showcasing the use of Spin Redis bindings within a guest component.

## Learning Summary

In this section you learned how to:

- [x] Connect to an external database (in this case, Redis) to persist data from your Spin app using the Redis Spin API

## Navigation

- Go back to [06 - Deploying to Fermyon Cloud](06-deploy-fermyon-cloud.md) if you still have questions on previous section
- Otherwise, proceed to [Bonus - Use SQLite Database in Fermyon Cloud to perform basic Retrieval Augmented Generation](08-embedding-and-sqlite.md)
