# ActivePlay

## What this is

Realtime companion server for City of Brass, a Rails app for running D&D sessions. Node.js /
Express / Socket.io process that brokers chat, dice rolls, and initiative tracking during a
play session. It has no UI of its own beyond a dev test page (`/ap`); City of Brass embeds its
JS/CSS and opens a socket connection to it.

## Domain

- **Campaign** (`socket.room`) — a play session's room. Everyone connected with the same
  `campaignId` shares chat, dice, and initiative state.
- **Resident** — a connected user, identified by `residentId` from the JWT. Also has their own
  private room (`campaignId:residentId`) for whispers and GM-only rolls.
- **Message** — chat text, markdown-rendered. Public if no `recipient`, otherwise a whisper to
  one resident's private room.
- **Dice roll** — parsed and rolled server-side (`lib/dice/*`), delivered as a `message` with
  `html` set instead of `text`. Same public/whisper split as chat messages.
- **Initiative** — GM-set turn order and entity list, broadcast to the whole campaign and
  persisted in Redis (`models/initiative.js`) so it survives reconnects.
- **Buff3r** — the last-50-messages-per-room history buffer, Redis-backed
  (`models/buff3r.js`), replayed to a resident on (re)connect.

Auth: a short-lived JWT signed with `ACTIVEPLAY_SECRET`, minted by City of Brass and verified on
the `login` socket event. No HTTP-level auth; everything happens over the socket.

## Commands

```bash
npm install                # deps (needs Redis running — see docker-compose.yml)
npm run dev                 # dev server, port 5050 (nodemon)
npm run build:css           # compile Sass once
npm run watch:css           # compile Sass on change
npm test                    # mocha, test/**
npm run lint                 # eslint
docker-compose up           # app + Redis via Docker
```

CI (`.github/workflows/ci.yml`) runs `npm run lint` and `npm test` on every push/PR.

## Gotchas

- `Gemfile`/`Gemfile.lock` exist only to pin the `kamal` gem for deploys. There is no Ruby
  application code here — don't go looking for one.
- `routes/index.js` is nearly empty. All real behavior is socket event handlers in
  `servers/chat.v0.6.js`, not HTTP routes.
- Redis is the only datastore. There is no SQL database, no migrations.
- `package.json` pins `socket.io` at `~4.8.3`, but the README says it must stay wire-compatible
  with the City of Brass client at 1.x — check the client version in City of Brass before
  touching this dependency; the two claims don't obviously agree and this was not resolved here.
- `models/user.js` (Redis-backed presence) exists but nothing calls it — the in-memory
  `self.rooms` map in `chat.v0.6.js` is the only source of who's online, and it resets on
  server restart.
- Production deploy (Kamal, `bin/kamal deploy`) and its secrets vault are documented in
  `README.md` — treat as high-risk, ask before touching `deploy.yml` or running a deploy.
