# Poor Man's Twitter

A lightweight Twitter-like application built as a technical assessment. Users can post tweets and view them in real time — no authentication required.

---

## Tech Stack

| Layer         | Technology               | Reason                                                                                   |
| ------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| Runtime       | Node.js + TypeScript     | Type safety, modern JS ecosystem                                                         |
| Web Framework | Fastify                  | Significantly faster than Express, built-in schema validation, plugin-based architecture |
| ORM           | TypeORM 0.3.x            | Decorator-based entity definition, clean DataSource API, excellent PostgreSQL support    |
| Database      | PostgreSQL               | Robust relational database, strong TypeORM integration                                   |
| Real-time     | Server-Sent Events (SSE) | Simpler than WebSockets for one-directional push, no extra libraries needed              |
| Frontend      | HTML / CSS / JavaScript  | Lightweight, no build step, meets the spec requirements                                  |

---

## Project Structure

```
src/
├── app.ts                        # Fastify app factory — registers plugins and routes
├── plugins/
│   ├── db.ts                     # TypeORM DataSource as a Fastify plugin
│   ├── cors.ts                   # CORS plugin
│   └── sensible.ts               # @fastify/sensible for better HTTP errors
├── entities/
│   └── Tweet.ts                  # TypeORM entity — maps to the tweets table
├── services/
│   └── tweet.service.ts          # Business logic layer — no HTTP concerns
├── routes/
│   └── tweets/
│       └── index.ts              # HTTP layer — validation, SSE, calls service
├── events/
│   └── tweet.emitter.ts          # Node.js EventEmitter for real-time events
├── database/
│   └── data-source.ts            # TypeORM DataSource configuration
└── types/
    └── index.ts                  # Shared TypeScript interfaces
frontend/
└── index.html                    # Standalone frontend — open directly in browser
```

---

## Architecture Decisions

### Layered architecture (Route → Service → Repository)

The codebase follows a strict separation of concerns:

- **Routes** handle HTTP — request validation, response codes, SSE headers
- **Services** handle business logic — database operations, event emission
- **Entities** define the data shape — no logic, just structure

This means business logic is fully decoupled from the HTTP layer. If the framework changed from Fastify to Express tomorrow, only the route layer would need updating.

### Fastify over Express

Fastify's plugin system and built-in JSON Schema validation were the primary reasons for this choice. Schema validation on the POST `/tweets` route means invalid requests are rejected automatically — no manual validation code needed.

### SSE over WebSockets

The spec requires one-directional real-time updates (server → client only). SSE is the right tool for this — it uses a standard HTTP connection, requires no extra libraries, and is natively supported by all modern browsers. WebSockets would introduce unnecessary bidirectional complexity.

### DB connection as a Fastify plugin

The TypeORM DataSource is registered as a Fastify plugin via `fastify-plugin`. This ensures:

- The connection is initialized once before any route handler runs
- The DataSource is decorated onto the Fastify instance (`fastify.db`)
- The connection is cleanly destroyed via the `onClose` lifecycle hook when the server shuts down

---

## API Endpoints

### `GET /api/tweets`

Returns all tweets ordered by creation date (newest first).

**Response `200`**

```json
[
  {
    "id": 1,
    "author": "Favour",
    "content": "Fastify is genuinely fast.",
    "createdAt": "2026-06-12T10:00:00.000Z"
  }
]
```

---

### `POST /api/tweets`

Creates a new tweet and broadcasts it to all connected SSE clients.

**Request body**

```json
{
  "author": "Favour",
  "content": "This is my tweet."
}
```

**Validation**

- `author` — required, string, max 100 characters
- `content` — required, string, max 280 characters

**Response `201`**

```json
{
  "id": 2,
  "author": "Favour",
  "content": "This is my tweet.",
  "createdAt": "2026-06-12T10:05:00.000Z"
}
```

---

### `GET /api/tweets/stream`

Opens a persistent SSE connection. The server pushes new tweets to the client as they are created.

**Event format**

```
data: {"id":2,"author":"Favour","content":"This is my tweet.","createdAt":"2026-06-12T10:05:00.000Z"}

```

A keep-alive ping comment is sent every 30 seconds to prevent connection timeout:

```
: ping

```

---

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL running locally

### 1. Clone the repository

```bash
git clone https://github.com/Favourof/poor-man-twitter
cd poor-mans-twitter
```

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your PostgreSQL credentials:

```bash
cp .env.example .env
```

`.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_pg_username
DB_PASSWORD=your_pg_password
DB_NAME=poor_mans_twitter
```

### 4. Create the database

```bash
psql -U your_pg_username -c "CREATE DATABASE poor_mans_twitter;"
```

### 5. Start the backend

```bash
npm run dev
```

The server starts at `http://localhost:3000`. TypeORM will automatically create the `tweets` table on first run via `synchronize: true`.

### 6. Open the frontend

Open `frontend/index.html` directly in your browser. No build step required.

---

## Real-time Flow

```
User submits tweet
      ↓
POST /api/tweets
      ↓
TweetService.createTweet()
      ↓
TypeORM saves to PostgreSQL
      ↓
tweetEmitter.emit("new-tweet", saved)
      ↓
SSE route listener fires
      ↓
reply.raw.write() pushes to all connected clients
      ↓
Browser receives event → prepends tweet to feed
```

---

## Environment Variables

| Variable      | Description         | Default     |
| ------------- | ------------------- | ----------- |
| `DB_HOST`     | PostgreSQL host     | `localhost` |
| `DB_PORT`     | PostgreSQL port     | `5432`      |
| `DB_USERNAME` | PostgreSQL username | —           |
| `DB_PASSWORD` | PostgreSQL password | —           |
| `DB_NAME`     | Database name       | —           |
