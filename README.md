# n8n-nodes-pollinations

This is an [n8n](https://n8n.io/) community node package for [Pollinations](https://gen.pollinations.ai) — generate **text, images, video, audio, 3D models and embeddings** from a single, OpenAI-compatible API.

[![npm version](https://img.shields.io/npm/v/n8n-nodes-pollinations.svg)](https://www.npmjs.com/package/n8n-nodes-pollinations)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

n8n is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

### Community nodes (self-hosted n8n)

1. Go to **Settings → Community nodes**.
2. Select **Install a community node**.
3. Enter `n8n-nodes-pollinations` and confirm.

### Manual install (development)

```bash
git clone https://github.com/your-org/n8n-nodes-pollinations.git
cd n8n-nodes-pollinations
npm install
npm run build
```

Then start n8n with the package loaded:

```bash
npm run dev
```

## Credentials

Every generation request needs a Pollinations API key.

1. Sign in at [enter.pollinations.ai](https://enter.pollinations.ai/keys) and create a key.
2. In n8n, create a **Pollinations API** credential and paste the key.
   - Secret keys start with `sk_` (server-side, no rate limit).
   - Publishable keys start with `pk_` (limited).

The credential is sent as `Authorization: Bearer <key>` and is verified against `GET /account/key`.

## Operations

The node is organised by **Resource → Operation**.

| Resource | Operation | Endpoint |
| --- | --- | --- |
| **Text** | Generate | `POST /v1/chat/completions` |
| **Image** | Generate | `GET /image/{prompt}` |
| **Video** | Generate | `GET /video/{prompt}` |
| **3D** | Generate | `GET /3d/{prompt}` |
| **Audio** | Speech | `POST /v1/audio/speech` |
| **Audio** | Transcribe | `POST /v1/audio/transcriptions` |
| **Embedding** | Create | `POST /v1/embeddings` |
| **Model** | Get Many | `GET /models`, `/text/models`, `/image/models`, … |
| **Account** | Get Balance / Profile / Usage / Usage (Daily) / Key Info | `GET /account/*` |
| **Media** | Upload / Get Metadata / List Gallery | `media.pollinations.ai` |

### Output

- **Text**: returns `{ text }` by default. Turn off **Simplify** to get the full chat completion response (usage, finish reason, etc.).
- **Image / Video / Audio / 3D**: returns the generated file as **n8n binary data** in the `data` property, plus a JSON `url`. Switch **Output** to *URL Only* to skip the download.
- **Model / Account / Media / Embedding**: returns JSON. Model lists can be split into one item per model.

## Usage

1. Add a **Pollinations** node to your workflow.
2. Pick a **Resource** and **Operation**.
3. Select your **Pollinations API** credential.
4. Fill in the model and prompt, then run the node.

Common examples:

- **Text**: Model `openai`, Prompt `Write a haiku about n8n`.
- **Image**: Model `flux`, Prompt `A cat in space, cinematic`. Wire the binary output into a *Write Binary File* node.
- **Video**: Model `veo`, Prompt `Sunset timelapse`, Duration `4`.
- **Audio / Speech**: Text `Hello world`, Voice `nova` → MP3 binary.
- **Audio / Transcribe**: point it at a binary audio field from a previous node.
- **Embedding**: Model `openai/text-embedding-3-small`, Input `Hello world`.

The node is also usable as a tool by [AI Agent](https://docs.n8n.io/advanced-ai/) nodes.

## Compatibility

- Requires n8n API version 1 (`n8nNodesApiVersion: 1`).
- Built and tested with Node.js 22.
- No runtime dependencies beyond `n8n-workflow`.

## Resources

- [Pollinations API documentation](https://gen.pollinations.ai/docs)
- [Model catalog](https://gen.pollinations.ai/models)
- [API keys & billing](https://enter.pollinations.ai)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## Version history

- **0.1.0** — Initial release: text, image, video, 3D, audio, embedding, model, account and media resources.

## License

[MIT](LICENSE.md)
