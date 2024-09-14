# Using the Spin Key/Value store to save responses

When using a Magic 8 Ball, usually you can keep asking your question and spinning the ball until you get the answer you want. Not for ours though! This Magic 8 Ball has a memory. This is achieved by persisting the questions and responses using Spin's [key/value store](https://developer.fermyon.com/spin/kv-store-api-guide).

Let's modify our `magic-8` component to store the questions asked, along with the random answer to Spin's key/value store.

We will need to:

1. Change the component to expect a body with a text question (`"Should I get a new haircut?"`).
1. Enable a default key/value store for our component
1. Check if that question has already been asked by looking it up in the key/value store.
   - a: If previously asked, return the previous answer.\*
   - b: If not previously asked, generate an answer, store the answer in the KV store, and return it.
     > `*` if the previous answer was "Ask again later", follow step b.

## 1: Giving our component access to a KV store

Give your `magic-8-ball` component access to a key/value store by adding `key_value_stores = ["default"]` to the component in your `spin.toml` file.

```toml
[component.magic-eight-ball]
...
ai_models = ["llama2-chat"]
key_value_stores = ["default"]
```

## 2: Storing questions and answers in our key/value store

The Spin SDK surfaces the Spin key value store interface to your language with operations such as `open` `get` `set` `delete` and more. The [Spin KV store API guide](https://developer.fermyon.com/spin/kv-store-api-guide) can be used to set and check previous question-answer pairs. 

### Here's the code snippet in **Rust** to do this

```rust
// Checks key/value store to see if the question has already been answered.
// If not answered, generates an answer, sets it in the KV store and returns it.
fn get_or_set_answer(question: String) -> Result<String> {
    // Open the default key/value store
    let store = Store::open_default()?;

    match store.get(&question) {
        Ok(Some(value)) => {
            let ans = std::str::from_utf8(&value)?.to_owned();
            if ans == "Ask again later." {
                let answer = answer(question.to_string())?;
                store.set(&question, answer.as_bytes())?;
                Ok(answer.to_owned())
            } else {
                Ok(ans)
            }
        }
        Ok(None) => {
            let answer = answer(question.to_string())?;
            store.set(&question, answer.as_bytes())?;
            Ok(answer.to_owned())
        }
        Err(error) => Err(error.into()),
    }
}
```

### Here's the code in **TypeScript**

```ts
import { ResponseBuilder, Llm } from "@fermyon/spin-sdk";

interface Answer {
    answer: String;
};

export async function handler(req: Request, res: ResponseBuilder) {
    const response: Answer = await req.text().then(data => {
        console.log(data);
        return answer(data);
    });
    console.log(response);
    res.statusCode = 200;
    res.headers.append("Content-Type", "application/json");
    res.send(JSON.stringify(response));
}

function getOrSetAnswer(question: string): Answer {
    let store = Kv.open("default");
    let response: Answer;
    let cachedResponse = store.get(question);
    if (cachedResponse == null) {
        response = askLlm(question);
        store.set(question, response);
    } else {
        response = JSON.parse(decoder.decode(cachedResponse));
    }
    return response;
}

function answer(question: string): Answer {
    const prompt: string = `<s>[INST] <<SYS>>
        You are acting as a Magic 8 Ball that predicts the answer to a questions about events now or in the future.
        Your tone should be expressive yet polite.
        Your answers should be 10 words or less.
        Prefix your response with 'Answer:'.
        <</SYS>>
        User: ${question}[/INST]"`;
    let response: Answer = { answer: Llm.infer(Llm.InferencingModels.Llama2Chat, prompt, {
        maxTokens: 20,
        repeatPenalty: 1.5,
        repeatPenaltyLastNTokenCount: 20,
        temperature: 0.25,
        topK: 5,
        topP: 0.25,
    }).text};
    // Parse the response to remove the expected `Answer:` prefix from the response
    console.log(response.answer);
    const answerPrefix = "Answer:";
    response.answer = response.answer.trim();
    if (response.answer.startsWith(answerPrefix)) {
        response.answer = response.answer.substring(answerPrefix.length);
    };
    return response;
}
```

### Here's the code in **Python**.

```Python
from spin_sdk import key_value

def getOrSetAnswer(question):
    store = key_value.open_default()
    response = ""
    if store.exists(question):
        response = (store.get(question)).decode('utf-8')
        if response == "Ask again later.":
            response = answer(question)
            store.set(question, response)
    else:
        response = answer(question)
        store.set(question, response.encode('utf-8'))
    return response
```

In all code snippets, the answer is retrieved from the key value store, or if the key does not exist, it stores both the question and response. You could also add a separate check if the Magic 8 Ball's response to a stored question was previously "Ask me again later", in which case the
new response is stored along with the question. The full code for the KV store can be [found here](https://github.com/fermyon/workshops/tree/main/spin/apps/05-spin-kv)

The [key value store tutorial](https://developer.fermyon.com/spin/kv-store-tutorial) is a helpful resource for a deep-dive into data persistence.

Now, we are ready to build and run our application again. Run this command and click on the URL to see the Magic 8 Ball frontend.

```bash
spin build --up
```

Notice how if you ask the same question twice, the second time is much quicker because the answer is cached.

### Learning Summary

In this section you learned how to:

- [x] Persist non-relational data using Spin's default key-value store using the Spin key/value API

### Navigation

- Go back to [04 - Magic 8 Ball Frontend](04-frontend.md) if you still have questions on previous section
- Otherwise, proceed to [06 - Deploy your Magic Ball Spin Application to Fermyon Cloud](06-deploy-fermyon-cloud.md)
