![preview](./docs/assets/preview.png)

---

<p align="center">
  <a href="https://trendshift.io/repositories/13868" target="_blank"><img src="https://trendshift.io/api/badge/repositories/13868" alt="groupultra%2Ftelegram-search | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</p>

<p align="center">
   [<a href="https://search.lingogram.app">Try it Now</a>] [<a href="./docs/README_CN.md">简体中文</a>] [<a href="./docs/README_JA.md">日本語</a>]
</p>

<p align="center">
  <a href="https://discord.gg/NzYsmJSgCT"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdiscord.com%2Fapi%2Finvites%2FNzYsmJSgCT%3Fwith_counts%3Dtrue&query=%24.approximate_member_count&suffix=%20members&logo=discord&logoColor=white&label=%20&color=7389D8&labelColor=6A7EC2"></a>
  <a href="https://t.me/+Gs3SH2qAPeFhYmU9"><img src="https://img.shields.io/badge/Telegram-%235AA9E6?logo=telegram&labelColor=FFFFFF"></a>
  <br>
  <a href="https://github.com/groupultra/telegram-search/releases"><img src="https://img.shields.io/github/package-json/v/groupultra/telegram-search?style=flat&colorA=080f12&colorB=1fa669"></a>
  <a href="https://github.com/groupultra/telegram-search/actions"><img src="https://img.shields.io/github/actions/workflow/status/groupultra/telegram-search/ci.yaml?style=flat&colorA=080f12&colorB=1fa669"></a>
  <a href="https://app.netlify.com/projects/tgsearch/deploys"><img src="https://api.netlify.com/api/v1/badges/89bfbfd2-0f73-41b0-8db4-4ab6b6512f6e/deploy-status"></a>
  <a href="https://deepwiki.com/groupultra/telegram-search"><img src="https://deepwiki.com/badge.svg"></a>
</p>

**Easily find and export your Telegram messages with powerful semantic search, supporting all languages and unsegmented sentences.**

Make message retrieval fast, accurate, and privacy-friendly — self-host or try online.

## 💖 Sponsors

![Sponsors](https://github.com/luoling8192/luoling8192/raw/master/sponsorkit/sponsors.svg)

## ✅ What Can It Do

### 📦 Export & Backup
- [x] Export to PostgreSQL or in-browser database (PGlite)
- [x] Universal export format for easy import to any database
- [ ] One-click export to CSV / JSON

### 🔍 Search Your Chat History
- [x] Keyword search: multi-language support (Chinese, English, etc.)
- [x] Natural language search: find messages like asking a question
- [ ] Smart filters: by contact/group, time range, with attachments, etc.

### 🔄 Sync & Storage
- [x] Incremental sync: sync while using
- [x] Storage options: server (PostgreSQL + pgvector) or browser-only mode (PGlite)
- [ ] Resume from breakpoint: auto-continue after failure

### 🧠 AI Capabilities (Planned)
- [ ] Ask AI about your chats: query current chat or selected range
- [ ] AI message summary: auto-extract key points, todos, conclusions
- [ ] AI-powered search: natural language queries with pinpointed results
- [ ] AI chat: converse with AI based on your chat context
- [ ] AI analysis: trends, sentiment, keywords, insights from links & files
- [ ] Local model support: local Embedding / inference (no cloud required)

### 🔗 Media & Links (Planned)
- [ ] Deep indexing for links & images: web summaries, image OCR/descriptions
- [ ] Attachment content extraction: PDFs, images, audio/video key frames & text

### 🌐 More Platforms (Planned)
- [ ] Multi-client support: Discord, etc.

## 🌐 Try it Now

We provide an online version where you can experience all features of Telegram Search without self-deployment.

> [!NOTE]
> We promise not to collect any user privacy data, you can use it with confidence

Visit: https://search.lingogram.app

## 🚀 Quick Start

### 1-Minute Start with Docker

> [!IMPORTANT]
> The simplest way to get started — no configuration needed. All features work with sensible defaults.

```bash
docker run -d --name telegram-search \
  -p 3333:3333 \
  -v telegram-search-data:/app/data \
  ghcr.io/groupultra/telegram-search:latest
```

Then open **http://localhost:3333** 🎉

### Advanced Setup (Optional)

<details>
<summary>🔧 Environment Variables</summary>

> [!TIP]
> All environment variables are optional. Customize only if needed.

| Variable | Description |
| --- | --- |
| `TELEGRAM_API_ID` | Telegram app ID from [my.telegram.org](https://my.telegram.org/apps) |
| `TELEGRAM_API_HASH` | Telegram app hash |
| `DATABASE_TYPE` | `postgres` or `pglite` (default: `pglite`) |
| `DATABASE_URL` | PostgreSQL connection string (only when `DATABASE_TYPE=postgres`) |
| `EMBEDDING_API_KEY` | API key for OpenAI/Ollama |
| `EMBEDDING_BASE_URL` | Custom embedding API base URL |
| `EMBEDDING_PROVIDER` | `openai` or `ollama` |
| `EMBEDDING_MODEL` | Model name |
| `EMBEDDING_DIMENSION` | Embedding dimension (e.g. `1536`, `1024`, `768`) |
| `PROXY_URL` | Proxy URL (e.g. `socks5://user:pass@host:port`) |

**Example with PostgreSQL & embeddings:**

```bash
docker run -d --name telegram-search \
  -p 3333:3333 \
  -v telegram-search-data:/app/data \
  -e TELEGRAM_API_ID=611335 \
  -e TELEGRAM_API_HASH=d524b414d21f4d37f08684c1df41ac9c \
  -e DATABASE_TYPE=postgres \
  -e DATABASE_URL=postgresql://<postgres-host>:5432/postgres \
  -e EMBEDDING_API_KEY=sk-xxxx \
  -e EMBEDDING_BASE_URL=https://api.openai.com/v1 \
  ghcr.io/groupultra/telegram-search:latest
```

**Proxy formats:**
- SOCKS5: `socks5://user:pass@host:port`
- SOCKS4: `socks4://user:pass@host:port`
- HTTP: `http://user:pass@host:port`
- MTProxy: `mtproxy://secret@host:port`

📖 **Full environment variable reference:** [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md)

</details>

### Start with Docker Compose

1. Clone repository.

2. Run docker compose to start all services including the database:

```bash
docker compose up -d
```

3. Access `http://localhost:3333` to open the search interface.

## 💻 Development Guide

> [!CAUTION]
> Development requires **Node.js >= 22.18** and **pnpm**. Make sure you have them installed.

### Browser-Only Mode

```bash
git clone https://github.com/groupultra/telegram-search.git
cd telegram-search
pnpm install
cp .env.example .env
pnpm run dev
```

### Server Mode (with Backend)

```bash
git clone https://github.com/groupultra/telegram-search.git
cd telegram-search
pnpm install
cp config/config.example.yaml config/config.yaml

# Start database (Docker)
docker compose up -d pgvector

# Start backend & frontend
pnpm run server:dev  # Terminal 1
pnpm run web:dev     # Terminal 2
```

📖 **More development details:** [CONTRIBUTING.md](./CONTRIBUTING.md)

## 🏗️ Architecture

This project is a **monorepo** with event-driven architecture:

- **`apps/web`**: Vue 3 frontend
- **`apps/server`**: WebSocket server
- **`packages/client`**: Client adapters & stores (Pinia)
- **`packages/core`**: Event bus (EventEmitter3), services, database models (Drizzle ORM)
- **`packages/common`**: Logger & utilities

**Key Technologies:**
- Event-driven with `CoreContext` (EventEmitter3)
- Real-time communication via WebSocket
- PostgreSQL + pgvector OR PGlite (in-browser)
- Message processing pipeline: Embedding, Jieba, Link, Media, User resolvers

📖 **Full architecture details, event flow, and diagrams:** [CONTRIBUTING.md](./CONTRIBUTING.md)

## ❓ FAQ

<details>
<summary><b>Do you collect any user data?</b></summary>

No. All data stays on your machine or server. We never collect or upload user data.

</details>

<details>
<summary><b>Do I need API keys to use this?</b></summary>

No. The application works with default settings. API keys are optional:
- Telegram API keys: Default keys work but have rate limits. Get your own for better performance.
- Embedding API keys: Only needed for semantic/natural language search.

</details>

<details>
<summary><b>What's the difference between browser mode and server mode?</b></summary>

- **Browser mode (PGlite)**: Runs entirely in your browser, no server needed. Good for personal use.
- **Server mode (PostgreSQL)**: Full-featured with better performance, suitable for production deployment.

</details>

<details>
<summary><b>Can I use my own embedding model?</b></summary>

Yes! Set `EMBEDDING_PROVIDER` to `ollama` and point `EMBEDDING_BASE_URL` to your local Ollama instance. See [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) for details.

</details>

<details>
<summary><b>How do I backup my data?</b></summary>

Your data is stored in:
- **Docker volume**: `telegram-search-data` (mounted to `/app/data`)
- **Browser mode**: Browser's IndexedDB

You can export messages to CSV/JSON anytime via the UI.

</details>

## 📚 Documentation

- **English**: [README.md](./README.md) (you're here!)
- **简体中文**: [README_CN.md](./docs/README_CN.md)
- **日本語**: [README_JA.md](./docs/README_JA.md)
- **Technical Architecture**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Environment Variables**: [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- **Security**: [SECURITY.md](./SECURITY.md)

## 🤝 Community

- **Discord**: [Join our Discord](https://discord.gg/NzYsmJSgCT)
- **Telegram**: [Join our Telegram group](https://t.me/+Gs3SH2qAPeFhYmU9)
- **DeepWiki**: [View documentation](https://deepwiki.com/groupultra/telegram-search)

## 🚨 Warnings
> [!WARNING]
> We have not issued any virtual currency, please do not be deceived.

> [!CAUTION]
> This software can only export your own chat records for search, please do not use it for illegal purposes.

## 🚀 Activity

![Alt](https://repobeats.axiom.co/api/embed/69d5ef9f5e72cd7901b32ff71b5f359bc7ca42ea.svg "Repobeats analytics image")

[![Star History Chart](https://api.star-history.com/svg?repos=groupultra/telegram-search&type=Date)](https://star-history.com/#groupultra/telegram-search&Date)
