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
| `REDISCLOUD_URL` | Redis connection URL (default: `redis://127.0.0.1:6379`) |
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

## Production deploy

Live at **https://activeplay.dnd.vandelden.family**.

Requires SSH access to `192.168.1.101` (deploy target) and `192.168.1.102` (remote builder), and 1Password CLI authed to `vandelden.1password.com`.

```bash
bin/kamal setup         # First deploy (one-time)
bin/kamal deploy        # Subsequent deploys
bin/kamal app logs      # Tail production logs
```

Secrets are fetched from the `Familie/ActivePlay` vault item via `op read` at deploy time. The `ACTIVEPLAY_SECRET` JWT signing key must match the value in `Familie/CityOfBrass` — keep both in sync.

socket.io is intentionally pinned to 1.x to remain wire-compatible with the cityofbrass client library.

### Infrastructure

| Component | Details |
|---|---|
| Deploy target | `192.168.1.101` via kamal-proxy |
| Remote builder | `192.168.1.102` (amd64 image build) |
| Registry | `registry.vandelden.family` |
| Redis | Accessory on `192.168.1.101`, data at `/home/app_storage/activeplay/redis` |
| Routing | Nginx Proxy Manager → kamal-proxy → app |

## Known bugs and incomplete features

| Issue | Details |
|---|---|
| User presence not persisted | `models/user.js` (Redis-backed) exists but is never called — user lists are lost on server restart |
| Encounter model never built | `Activeplay::Encounter` is referenced in City of Brass test stubs but was never implemented |
| Mobile support | A phone layout stub exists in City of Brass but ActivePlay has no mobile-specific handling |
| Outdated stack | Socket.io 1.x and Express 4.13 are still legacy and should be upgraded |
