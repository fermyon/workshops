#!/bin/bash

mkdir -p .spin/ai-models
curl -OL https://huggingface.co/TheBloke/Llama-2-13B-chat-GGML/resolve/main/llama-2-13b-chat.ggmlv3.q3_K_L.bin
mv llama-2-13b-chat.ggmlv3.q3_K_L.bin .spin/ai-models/llama2-chat