# @waynew8623/n8n-nodes-pollinations

**简体中文** | [English](#english)

基于 [Pollinations](https://gen.pollinations.ai) 的 [n8n](https://n8n.io/) 社区节点。用一个 OpenAI 兼容的 API，在 n8n 工作流里生成**文本、图像、视频、音频、3D 模型和向量嵌入**。

[![npm version](https://img.shields.io/npm/v/@waynew8623/n8n-nodes-pollinations.svg)](https://www.npmjs.com/package/@waynew8623/n8n-nodes-pollinations)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n](https://img.shields.io/badge/n8n-community%20node-EA4B71.svg)](https://docs.n8n.io/integrations/community-nodes/)

n8n 是一个 [fair-code 许可](https://docs.n8n.io/sustainable-use-license/)的工作流自动化平台。

> **说明**：npm 上的 `n8n-nodes-pollinations` 已被 Pollinations 官方包占用，因此本节点发布为 scoped 包 **`@waynew8623/n8n-nodes-pollinations`**。两者是相互独立、由不同作者维护的实现：官方包拆分为多个单一功能节点，本包则是**一个统一的 Pollinations 节点**（9 个资源 / 16 个操作），并额外覆盖 3D 生成、账户用量与媒体上传。本项目与 Pollinations 官方无隶属关系。

---

## 简体中文

### 目录

- [功能特性](#功能特性)
- [安装](#安装)
- [凭据配置](#凭据配置)
- [支持的操作](#支持的操作)
- [输出说明](#输出说明)
- [使用示例](#使用示例)
- [兼容性](#兼容性)
- [开发与调试](#开发与调试)
- [常见问题](#常见问题)
- [作者](#作者)
- [许可证](#许可证)

### 功能特性

- **9 个资源、16 个操作**，覆盖 Pollinations 的全部生成能力
- 图像 / 视频 / 音频 / 3D 结果直接以 **n8n 二进制数据**返回，可无缝接到「写文件」「上传云盘」「发送邮件」等下游节点；也可只取 URL
- 文本生成默认只输出纯文本，关闭「Simplify」可拿到完整响应（含 usage、finish reason）
- 模型列表可按类型、来源、能力、可靠性过滤，并自动从 `Link` 响应头解析媒体地址
- 账户资源可查余额、资料、用量与密钥权限
- 标记为 `usableAsTool`，可被 **AI Agent** 节点当作工具调用
- **零运行时依赖**，只依赖 n8n 自带的 `n8n-workflow`

### 安装

**方式一：社区节点（自托管 n8n）**

1. 打开 **Settings（设置）→ Community nodes（社区节点）**
2. 选择 **Install a community node（安装社区节点）**
3. 输入 `@waynew8623/n8n-nodes-pollinations` 并确认

**方式二：用 npm 安装**

```bash
# 在 n8n 的 .n8n/custom 目录，或你自己的节点开发环境里
npm install @waynew8623/n8n-nodes-pollinations
```

**方式三：手动安装（开发用）**

```bash
git clone https://github.com/waynew8623/n8n-nodes-pollinations.git
cd n8n-nodes-pollinations
npm install
npm run build
```

然后以开发模式启动 n8n（节点会被加载并支持热重载）：

```bash
npm run dev
```

n8n 默认运行在 http://localhost:5678。

### 凭据配置

所有生成请求都需要 Pollinations API Key。

1. 前往 [enter.pollinations.ai/keys](https://enter.pollinations.ai/keys) 创建密钥
2. 在 n8n 中新建 **Pollinations API** 凭据，粘贴密钥
   - 密钥（`sk_` 开头）：服务端使用，无速率限制
   - 可发布密钥（`pk_` 开头）：能力受限

凭据会以 `Authorization: Bearer <key>` 发送，并通过 `GET /account/key` 做连通性校验。

### 支持的操作

节点按 **资源（Resource）→ 操作（Operation）** 组织：

| 资源 | 操作 | 接口 |
| --- | --- | --- |
| Text（文本） | Generate（生成文本） | `POST /v1/chat/completions` |
| Image（图像） | Generate（生成图像） | `GET /image/{prompt}` |
| Video（视频） | Generate（生成视频） | `GET /video/{prompt}` |
| 3D | Generate（生成 3D 模型） | `GET /3d/{prompt}` |
| Audio（音频） | Speech（语音合成 TTS） | `POST /v1/audio/speech` |
| Audio（音频） | Transcribe（语音转写 STT） | `POST /v1/audio/transcriptions` |
| Embedding（嵌入） | Create（创建嵌入） | `POST /v1/embeddings` |
| Model（模型） | Get Many（获取模型列表） | `GET /models`、`/text/models` 等 |
| Account（账户） | Get Balance（查询余额） | `GET /account/balance` |
| Account（账户） | Get Profile（查询资料） | `GET /account/profile` |
| Account（账户） | Get Usage（查询用量） | `GET /account/usage` |
| Account（账户） | Get Usage Daily（查询每日用量） | `GET /account/usage/daily` |
| Account（账户） | Get Key Info（查询密钥信息） | `GET /account/key` |
| Media（媒体） | Upload（上传文件） | `POST media.pollinations.ai/upload` |
| Media（媒体） | Get Metadata（查询文件元数据） | `GET media.pollinations.ai/{id}/metadata` |
| Media（媒体） | List Gallery（列出公开图库） | `GET media.pollinations.ai/media?tag=` |

常用的可选参数（在 **Options** 折叠面板里）：

- **文本**：`temperature`、`top_p`、`max_tokens`、`seed`、`reasoning_effort`、JSON 模式、`safe` 安全过滤、`private`
- **图像**：`width` / `height`、`seed`、`nologo`、`enhance`、参考图 `image`、`safe`
- **视频**：`duration`、`aspectRatio`、首帧图 `image`、`seed`
- **3D**：`resolution`（low/medium/high）、参考图 `image`
- **音频（TTS）**：35 种音色（`nova`、`alloy`、`shimmer` 等）、输出格式（mp3/opus/aac/flac/wav/pcm）
- **嵌入**：批量输入（JSON 数组，最多 32 条）、`dimensions`、`encoding_format`

### 输出说明

- **文本**：默认返回 `{ "text": "..." }`。关闭 **Simplify** 可得到完整响应（含 `usage`、`finish_reason` 等）
- **图像 / 视频 / 音频 / 3D**：结果写入 n8n 的 **binary** 字段 `data`，同时在 JSON 里附带 `url`。把 **Output** 切换为 *URL Only* 可跳过下载，只拿链接
- **模型 / 账户 / 媒体 / 嵌入**：返回 JSON。模型列表可选择「每个模型一个 item」或整体一个 item

### 使用示例

1. 在工作流中添加 **Pollinations** 节点
2. 选择 **Resource** 与 **Operation**
3. 选中你的 **Pollinations API** 凭据
4. 填写模型与提示词，运行节点

几个常见组合：

| 场景 | 参数 |
| --- | --- |
| 文本生成 | Resource `Text`，Model `openai`，Prompt `用五言绝句写一下 n8n` |
| 文生图 | Resource `Image`，Model `flux`，Prompt `太空里的猫，电影感`，Width/Height `1024` |
| 文生视频 | Resource `Video`，Model `veo`，Prompt `日落延时`，Duration `4` |
| 语音合成 | Resource `Audio` → `Speech`，Text `你好，世界`，Voice `nova` |
| 语音转写 | Resource `Audio` → `Transcribe`，Input Type 选 `Binary File`，指向上一节点的音频字段 |
| 文本嵌入 | Resource `Embedding`，Model `openai/text-embedding-3-small`，Input `你好，世界` |
| 查余额 | Resource `Account` → `Get Balance` |

图像生成的输出可直接连到 **Write Binary File**、**S3**、**Google Drive** 等节点保存文件。

### 兼容性

- 要求 n8n API 版本 1（`n8nNodesApiVersion: 1`）
- 开发与构建环境：Node.js 22 及以上
- 除 peer 依赖 `n8n-workflow` 外，无任何运行时依赖

### 开发与调试

```bash
npm install        # 安装依赖
npm run dev        # 启动带节点的 n8n，支持热重载
npm run lint       # 运行 n8n 节点规范检查
npm run lint:fix   # 自动修复可修复的问题
npm run build      # 编译到 dist/
npm run release    # 走 release-it 发版（会打 tag 并触发发布工作流）
```

**发布到 npm 说明**

- 本包名为 **`@waynew8623/n8n-nodes-pollinations`**。它是 scoped 包，必须显式声明 `"publishConfig": { "access": "public" }`（已配置），否则默认会以私有方式发布
- n8n 要求社区节点通过 GitHub Actions 发布并附带 **npm provenance 声明**。本仓库已内置 `.github/workflows/publish.yml`：在 npm 后台把本仓库设为 **Trusted Publisher**（仓库 `waynew8623/n8n-nodes-pollinations`，工作流 `publish.yml`）即可，无需在 GitHub 保存 token
- 也可本地手动发布（不带 provenance，适用于自托管 n8n；若要通过 n8n Cloud 认证，请走上面的工作流）：

```bash
npm publish --access public
```

### 常见问题

**节点在 n8n 里找不到？**

1. 确认执行过 `npm install`
2. 确认 `package.json` 的 `n8n.nodes` 数组里登记了该节点
3. 用 `npm run dev` 重启服务
4. 查看控制台是否有报错

**生成请求返回 401？**

检查 API Key 是否正确、是否已过期，以及账户余额是否充足（用 `Account → Get Balance` 查询）。

**图像/视频节点输出很大怎么办？**

把 **Output** 切为 *URL Only*，只拿链接；或把 media.pollinations.ai 返回的 URL 存库，避免二进制在流程里反复传递。

### 作者

**waynew8623**

- 个人博客：[https://waynetalk.com](https://waynetalk.com)
- GitHub：[@waynew8623](https://github.com/waynew8623)

### 许可证

[MIT](LICENSE.md)

---

## English

### Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Credentials](#credentials)
- [Supported Operations](#supported-operations)
- [Output](#output)
- [Usage](#usage)
- [Compatibility](#compatibility)
- [Development](#development)
- [FAQ](#faq)
- [Author](#author)
- [License](#license)

### Features

- **9 resources, 16 operations** covering the full Pollinations generation surface
- Images, video, audio and 3D models come back as **n8n binary data**, ready to feed into down-stream nodes such as *Write Binary File*, *S3* or *Google Drive*; a URL-only mode is also available
- Text generation returns plain text by default; turn off **Simplify** to get the full response (usage, finish reason)
- Model catalog can be filtered by type, source, capabilities and reliability, and media URLs are parsed from the `Link` response header
- Account resource exposes balance, profile, usage and API key permissions
- Marked `usableAsTool`, so **AI Agent** nodes can call it as a tool
- **Zero runtime dependencies** beyond the peer `n8n-workflow`

### Installation

**Option 1 — Community nodes (self-hosted n8n)**

1. Go to **Settings → Community nodes**
2. Select **Install a community node**
3. Enter `@waynew8623/n8n-nodes-pollinations` and confirm

**Option 2 — Install with npm**

```bash
# inside your n8n .n8n/custom folder or your own node dev setup
npm install @waynew8623/n8n-nodes-pollinations
```

**Option 3 — Manual (development)**

```bash
git clone https://github.com/waynew8623/n8n-nodes-pollinations.git
cd n8n-nodes-pollinations
npm install
npm run build
```

Then start n8n with the package loaded and hot reload enabled:

```bash
npm run dev
```

n8n runs at http://localhost:5678 by default.

### Credentials

Every generation request needs a Pollinations API key.

1. Create a key at [enter.pollinations.ai/keys](https://enter.pollinations.ai/keys)
2. In n8n, create a **Pollinations API** credential and paste the key
   - Secret keys (`sk_...`) are for server-side use and have no rate limit
   - Publishable keys (`pk_...`) have limited scope

The key is sent as `Authorization: Bearer <key>` and verified against `GET /account/key`.

### Supported Operations

The node is organised by **Resource → Operation**:

| Resource | Operation | Endpoint |
| --- | --- | --- |
| Text | Generate | `POST /v1/chat/completions` |
| Image | Generate | `GET /image/{prompt}` |
| Video | Generate | `GET /video/{prompt}` |
| 3D | Generate | `GET /3d/{prompt}` |
| Audio | Speech (TTS) | `POST /v1/audio/speech` |
| Audio | Transcribe (STT) | `POST /v1/audio/transcriptions` |
| Embedding | Create | `POST /v1/embeddings` |
| Model | Get Many | `GET /models`, `/text/models`, … |
| Account | Get Balance | `GET /account/balance` |
| Account | Get Profile | `GET /account/profile` |
| Account | Get Usage | `GET /account/usage` |
| Account | Get Usage Daily | `GET /account/usage/daily` |
| Account | Get Key Info | `GET /account/key` |
| Media | Upload | `POST media.pollinations.ai/upload` |
| Media | Get Metadata | `GET media.pollinations.ai/{id}/metadata` |
| Media | List Gallery | `GET media.pollinations.ai/media?tag=` |

Frequently used optional parameters (under the **Options** collection):

- **Text**: `temperature`, `top_p`, `max_tokens`, `seed`, `reasoning_effort`, JSON mode, `safe` filters, `private`
- **Image**: `width` / `height`, `seed`, `nologo`, `enhance`, reference `image`, `safe`
- **Video**: `duration`, `aspectRatio`, first-frame `image`, `seed`
- **3D**: `resolution` (low/medium/high), reference `image`
- **Audio (TTS)**: 35 voices (`nova`, `alloy`, `shimmer`, …) and output format (mp3/opus/aac/flac/wav/pcm)
- **Embedding**: batch input (JSON array, up to 32 items), `dimensions`, `encoding_format`

### Output

- **Text**: returns `{ "text": "..." }` by default. Turn off **Simplify** for the full chat completion response (including `usage` and `finish_reason`)
- **Image / Video / Audio / 3D**: the generated file is returned as n8n **binary** data in the `data` property, with a `url` in the JSON alongside it. Set **Output** to *URL Only* to skip the download
- **Model / Account / Media / Embedding**: returns JSON. The model list can be split into one item per model

### Usage

1. Add a **Pollinations** node to your workflow
2. Pick a **Resource** and **Operation**
3. Select your **Pollinations API** credential
4. Fill in the model and prompt, then run the node

Common combinations:

| Scenario | Parameters |
| --- | --- |
| Text | Resource `Text`, Model `openai`, Prompt `Write a haiku about n8n` |
| Text to image | Resource `Image`, Model `flux`, Prompt `A cat in space, cinematic`, Width/Height `1024` |
| Text to video | Resource `Video`, Model `veo`, Prompt `Sunset timelapse`, Duration `4` |
| Text to speech | Resource `Audio` → `Speech`, Text `Hello world`, Voice `nova` |
| Speech to text | Resource `Audio` → `Transcribe`, Input Type `Binary File`, point at the audio field from a previous node |
| Embeddings | Resource `Embedding`, Model `openai/text-embedding-3-small`, Input `Hello world` |
| Balance | Resource `Account` → `Get Balance` |

Generated images can be piped straight into *Write Binary File*, *S3*, *Google Drive* and similar nodes.

### Compatibility

- Requires n8n API version 1 (`n8nNodesApiVersion: 1`)
- Built and tested with Node.js 22+
- No runtime dependencies other than the peer `n8n-workflow`

### Development

```bash
npm install        # install dependencies
npm run dev        # start n8n with the node loaded (hot reload)
npm run lint       # run the n8n node linter
npm run lint:fix   # auto-fix what can be fixed
npm run build      # compile to dist/
npm run release    # release via release-it (tags and triggers the publish workflow)
```

**Publishing notes**

- The package name is **`@waynew8623/n8n-nodes-pollinations`**. It is scoped, so it must declare `"publishConfig": { "access": "public" }` (already configured) — otherwise npm publishes it as private
- n8n requires community nodes to be published through GitHub Actions with an **npm provenance** statement. This repository ships `.github/workflows/publish.yml`: configure this repository as a **Trusted Publisher** in your npm package settings (repository `waynew8623/n8n-nodes-pollinations`, workflow `publish.yml`) — no token needs to be stored in GitHub
- You can also publish manually (no provenance; fine for self-hosted n8n, but use the workflow above if you plan to submit for n8n Cloud verification):

```bash
npm publish --access public
```

### FAQ

**The node does not show up in n8n**

1. Make sure you ran `npm install`
2. Check that the node is registered in the `n8n.nodes` array of `package.json`
3. Restart with `npm run dev`
4. Look for errors in the console

**Generation returns 401**

Check that the API key is correct and not expired, and that the account has pollen left (use `Account → Get Balance`).

**The output of image/video nodes is very large**

Switch **Output** to *URL Only* and keep just the link, or persist the media.pollinations.ai URL instead of passing binary data through the whole workflow.

### Author

**waynew8623**

- Blog: [https://waynetalk.com](https://waynetalk.com)
- GitHub: [@waynew8623](https://github.com/waynew8623)

### License

[MIT](LICENSE.md)
