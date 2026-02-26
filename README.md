# ActivePlay

Realtime companion server for [City of Brass](../cityofbrass) — a web app for running D&D sessions. Provides live chat, dice rolling, and initiative tracking during play sessions.

## What it does

- **Chat** — public messages and private whispers between GM and players
- **Dice rolling** — polyhedral (d4–d100, NdX+bonus), Fate/Fudge dice, named rolls, GM-only rolls
- **Initiative tracker** — GM manages turn order; all connected players see updates in realtime
- **Message history** — last 50 messages replayed on reconnect (Redis-backed)
- **Message rendering** — URLs auto-linked, images embedded, `[text](url)` markdown links

## Architecture

```
City of Brass (Rails)
  └── mints a short-lived JWT (ACTIVEPLAY_SECRET)
  └── serves the three-column DnD session layout
        ├── pins/imports activeplay.v0.7.js (Stimulus controllers) + CSS
        └── browser opens a Socket.io connection to ActivePlay using the JWT

ActivePlay (this app — Node.js / Express / Socket.io)
  └── verifies JWT, assigns user to campaign room
  └── brokers realtime events: chat, dice rolls, initiative state
  └── buffers last 50 messages per room in Redis
  └── uses Redis pub/sub adapter for horizontal scaling
```

Socket.io namespace: `/activeplay/v0.6`

Frontend: Stimulus controllers + ES modules (importmap-friendly), served from `/src/js` (entrypoint `/public/javascripts/activeplay.v0.7.js`).

## Setup

### Install dependencies

```bash
npm install
```

Requires a running Redis instance. In development you can run one locally (`redis-server`) or use the Docker setup below.

### Environment variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default: `3000`) |
| `ACTIVEPLAY_SECRET` | Shared JWT secret — must match `ACTIVEPLAY_SECRET` in City of Brass `application.yml` |
| `REDISCLOUD_URL` | Redis connection URL (e.g. `redis://localhost:6379`) |
| `CORS_WHITE_LIST` | Comma-separated list of allowed origins (e.g. `http://localhost:3000`) |

In City of Brass, also set:
- `ACTIVEPLAY_SECRET` — same value as above
- `ACTIVEPLAY_URL` — URL where this app is hosted (e.g. `http://localhost:5050`)

### Docker

```bash
docker-compose build
docker-compose up
```

## Running

**Development**:

```bash
npm run dev
```

In a second terminal, compile/watch CSS:

```bash
npm run build:css
# or
npm run watch:css
```

Serves on `http://localhost:5050` by default. A dev test page is available at `/ap` (development only, importmap-style module loading).

**Production:**

```bash
npm start
```

## Chat commands

| Command | Description |
|---|---|
| `/w <user> <message>` | Whisper to a specific user (also `/pm`, `/whisper`) |
| `/gmr <dice>` | GM-only dice roll — result visible only to GM |
| `/gmroll <dice>` | Same as `/gmr` |

## Dice syntax

| Example | Description |
|---|---|
| `d20` | Roll a single d20 |
| `2d6+3` | Roll 2d6 and add 3 |
| `4dF` | Roll Fate/Fudge dice |
| `"Stealth check" d20+5` | Named roll |

## Known bugs and incomplete features

| Issue | Details |
|---|---|
| CORS not enforced | `cors` middleware exists but is commented out in `app.js:26` — any origin can connect |
| Duplicate socket handler | `initiative:setEntities` is registered twice in `servers/chat.v0.6.js` |
| User presence not persisted | `models/user.js` (Redis-backed) exists but is never called — user lists are lost on server restart |
| No test suite | `package.json` references `mocha test/` but no `test/` directory exists |
| Encounter model never built | `Activeplay::Encounter` is referenced in City of Brass test stubs but was never implemented |
| Mobile support | A phone layout stub exists in City of Brass but ActivePlay has no mobile-specific handling |
| Outdated stack | Node.js engine still declares `^6.0.0` (EOL 2019), Socket.io 1.x |
