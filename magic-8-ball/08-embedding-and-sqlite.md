# Bonus Exercise: Use SQLite Database in Fermyon Cloud to perform basic Retrieval Augmented Generation

A typical use case for LLM generation is to be able to provide the model with facts from the outside world that haven't been trained into the model. This is called Retrieval Augmented Generation (a.k.a RAG) and is the method by which services like OpenAI are able to answer questions about current events. However we only want to provide facts in the prompt that are relevant to the question being asked. 

For example, if we were to ask the question "Will it rain today?" the answer would be completely random in our current iteration. If we could provide the LLM prompt with additional facts like "Weather forecast: 80% precipitation" then it could provide more accurate answers. But how do we find these relevant facts? 

The answer is by using embeddings. A separate model `all-MiniLM-L6-v2` can take a piece of text like "Weather forecase: 80% precipitation" and generate a vector with 384 dimensions represented by an array of float32. We can also take our question of "Will it rain today?" and generate an embedding vector and calculate the cosine similarity of the two vectors in order to rank facts by the most relevant.

Included in the Spin SDK is a `generateEmbeddings` function that uses the `all-MiniLM-L6-v2` model to generate embedding vectors. Fermyon Cloud offers a SQLite database (backed by Turso) that includes a vector similarity search function. Using these two pieces of the Spin SDK, let's see if we can provide the LLM prompt with some relevant facts.

If developing locally, we will need a SQLite database that has the `sqlite-vss` extension enabled. When running Spin locally, the provided SQLite database doesn't have the ability to add SQLite extensions. We can however tell Spin to use a remote database like [Turso](https://turso.tech/). See the appendix below to setup using Turso.

Create the SQLite database in Fermyon Cloud

```shell
spin cloud sqlite create magic8
```

Let's create a table to hold the contexts we want to add to the LLM prompt. Note that the `sqlite-vss` extension expects the embedding to be stored either as JSON text or a native blob.

```sql
CREATE TABLE IF NOT EXISTS contexts(
    'id' TEXT PRIMARY KEY,
    'text' TEXT,
    'embedding' BLOB
);
```

Save the above statement into a file called `migration.sql`. Now let's execute the statement on our SQLite database:

```shell
spin cloud sqlite execute -d magic8 @migration.sql
```

Next we need to allow our Spin app to access the SQLite database and also allow it to use the `all-minilm-l6-v2` model. Update our `spin.toml` file with:

```toml
[component.magic-eight-ball]
...
ai_models = ["llama2-chat", "all-minilm-l6-v2"]
sqlite_databases = ["default"]
```

Now that we have somewhere to save the context, let's see how we generate embeddings using Spin's SDK. In Typescript it looks like:

```typescript
function addContext(text: string): ParagraphEmbedding[] {
  const db = Sqlite.openDefault();

  // generate an embedding vector for each paragraph
  const paragraphs = text.split("\n").filter(s => s != null && s != "");
  const embeddings = Llm.generateEmbeddings(EmbeddingModels.AllMiniLmL6V2, paragraphs).embeddings;

  // store each paragraph with it's corresponding embedding
  let results = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const result: ParagraphEmbedding = {
      id: uuidv4(),
      text: paragraphs[i],
      embedding: embeddings[i],
    };

    db.execute("INSERT INTO contexts (id, text, embedding) VALUES (?, ?, ?) ", [result.id, result.text, JSON.stringify(result.embedding)]);
    results.push(result);
  }

  return results;
}
```

See if you can wire up the above function into your Spin application (ask for help if you get stuck).

Now let's add some contexts.

```shell
curl -X POST http://localhost:3000/magic-8/contexts \
--data-binary @- << EOF
Weather forecast for today shows 80% chance of rain
EOF
```

Now we need to create a virtual table we can use as an index to find contexts. Save the into another SQL script called `reindex.sql`.

```
DROP TABLE IF EXISTS vss_contexts;

CREATE virtual TABLE vss_contexts USING vss0(embedding(384));

INSERT INTO vss_contexts(rowid, embedding) SELECT rowid, embedding from contexts;
```

Let's update the database with our indexed virtual table.

```shell
spin cloud sqlite execute -d magic8 @migration.sql
```

Next we need to generate an embedding for our question when it comes in and query the sqlite database to find relevant context. Here's a sample:

```typescript
let embedding = Llm.generateEmbeddings(EmbeddingModels.AllMiniLmL6V2, [question]).embeddings[0]
let values = db.execute("select rowid from vss_contexts where vss_search(embedding, ?) limit 6;", [JSON.stringify(embedding)])
```

## Appendix: Setup Turso

Go to [turso.tech](https://turso.tech/) and sign up for a free account. 

Follow the [turso cli installation instructions](https://docs.turso.tech/cli/installation).

Login using the Turso CLI

```shell
turso auth login
```

Create a database with extensions enabled and generate a token for it

```shell
turso db create --enable-extensions
# Get the hostname for the Turso database (don't include the scheme)
turso db show <db-name>
# Create access token
turso db tokens create <db-name> --expiration none
```

Tell Spin to use the Turso DB when running locally.

```shell
cp runtime-config-template.toml runtime-config.toml
# add the url and token from Turso to the file
```

## Learning Summary

In this section you learned how to:

- [x] Persist relational data using Spin's default SQLite store using the Spin SQLite API

## Navigation

- Go back to [08- Running Spin on Kubernetes](08-kubernetes.md) if you still have questions on previous section
- Otherwise, congrats on finishing the workshop!
- (_optionally_) Let us know what you thought of the Spin and the workshop with this [short Typeform survey](https://fibsu0jcu2g.typeform.com/to/RK08OLSy#hubspot_utk=xxxxx&hubspot_page_name=xxxxx&hubspot_page_url=xxxxx).
