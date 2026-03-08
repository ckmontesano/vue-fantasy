# Monte Fantasy Baseball — Full Revamp Plan

This document is an exhaustive implementation and handoff plan for the Monte Fantasy Baseball revamp. It is intended to be the single canonical artifact for any engineer or agent taking over the project. It contains the architecture, data models, API contracts, scoring rules, Draft Day realtime design, caching and ingestion strategy, security, deployment, test plan, timeline, and a file‑by‑file scaffold plan for implementation.

> **WARNING:** This repository has been replaced with this planning document. The next steps are to follow this plan to implement the server and client scaffolds in TypeScript, wire ingestion, create the Docker-based local environment, and implement comprehensive tests.

---

## Table of Contents

- [Overview & goals](#overview--goals)
- [Key constraints & decisions](#key-constraints--decisions-final)
- [System architecture](#system-architecture)
- [Data model (Mongo collections)](#data-model-mongo-collections)
- [Scoring rules (explicit)](#scoring-rules-explicit)
- [Backend API (v1) — endpoints](#backend-api-v1---endpoints)
- [Draft Day realtime design (Socket.IO)](#draft-day-realtime-design-socketio)
- [Ingestion & caching strategy](#ingestion--caching-strategy)
- [Admin & security](#admin--security)
- [Frontend (Vue 3 + Chakra UI)](#frontend-vue-3--chakra-ui)
- [Docker & deployment](#docker--deployment)
- [Persistence, backups & autosave policy](#persistence-backups-and-autosave-policy)
- [Testing & QA plan](#testing--qa-plan)
- [Observability & monitoring](#observability--monitoring)
- [Migration & rollout strategy](#migration--rollout-strategy)
- [File/folder scaffold and tasks](#filefolder-scaffold-and-tasks)
- [Implementation task list (prioritized)](#implementation-task-list-prioritized)
- [Runbook: local dev & commands](#runbook-local-dev--commands)
- [Appendix — API contract examples](#appendix--api-contract-examples)
- [Handoff checklist](#handoff-checklist)
- [Final notes](#final-notes)

---

## Overview & goals

This revamp consolidates league state server-side and rebuilds the client with Vue 3 and Chakra UI. The primary functional objectives:

- Replace client-heavy MLB & logos calls with a single backend that fetches and caches external data.
- Move persistent league state (standings, teams, owners, odds snapshots, draft sessions, monthly results) into MongoDB via a Node/Express + Mongoose backend.
- Remove localStorage persistence and hardcoded assets from the client; client becomes a UI-only consumer of shaped API endpoints.
- Implement a Draft Day realtime experience where users connect, ready up, and perform a timed draft; draft state is stored in memory and backed up per-round, with final persistence performed once at draft completion.
- Implement precise scoring: teams drafted, not players. Vegas American odds at draft snapshot produce points (Option 2: `points = max(100, abs(americanOdds))`). Monthly winners are determined by points; money payouts are computed from `monthlyWager` and the number of players who do not tie for first.
- Containerize the stack with `docker-compose` for local development and TrueNAS-friendly deployment.

## Key constraints & decisions (final)

- Tech stack: Node.js + Express (TypeScript), MongoDB (Mongoose), Vue 3 + Vite + TypeScript for client, Chakra UI Vue for styling. Realtime layer: Socket.IO.
- Odds → points: Option 2. `points = max(100, abs(integer(AmericanOdds)))`. Raw odds strings are stored as well (e.g., `+1200` / `-150`).
- Season months: inclusive April → September.
- Division ties: if a team is tied for first in its division, that team's points are split evenly among tied teams' owners (fractional points allowed).
- Monthly pot money: `monthlyPot = monthlyWager * (numberOfPlayers - winnersCount)` i.e. collect only from players who are not tied for first. Pot split equally among winners (integer cents); leftover cents go to `leagueBankCents`.
- Unowned teams: yield no points and no money; ties that include unowned teams are not credited to anyone.
- Draft Day behavior: lobby with Ready state; random order reveal for 30s; default 60s per pick (configurable); on timeout server auto-picks team with highest division points from available pool (random among ties); autosave snapshots after each round (one round = one pick per player). Final draft persisted at completion.
- Admin auth: shared `ADMIN_TOKEN` (32‑byte hex) — server autogenerates one on first-run if not provided via env; hashed and stored in DB.

## System architecture

High level components:

- **Client** (Vue 3 + Chakra UI): renders pages, connects via REST to API for static data and via Socket.IO for Draft Day realtime.
- **Server** (Node + Express + Socket.IO): REST API, ingestion workers, caching, compute routines, Socket.IO runtime for drafts.
- **MongoDB**: single database instance (docker-compose or Atlas). Collections hold canonical data, caches, and draft snapshots.
- **External APIs**:
  - MLB data via Swagger: `https://raw.githubusercontent.com/joerex1418/mlb-statsapi-swagger-docs/refs/heads/main/swagger-docs.json` (standings and MLB metadata).
  - Odds provider: The Odds API: `https://the-odds-api.com` (store API key in `ODDS_API_KEY`).

**Deployment topology**

- Local: `docker-compose` with services: `mongo`, `server`, `client` (nginx serving built client). Server fetches and caches external data.
- Production: similar but use managed MongoDB (Atlas). Keep secrets out of repo.

## Data model (Mongo collections)

Below are the core collections and essential fields. Use Mongoose + TypeScript interfaces. Prefer `Decimal128` for high-precision fractional points where appropriate.

### 1) leagueSettings
- `_id`: ObjectId
- `name`: string
- `season`: number
- `seasonStart`: Date
- `seasonEnd`: Date
- `seasonMonths`: [string] (e.g. `['2026-04', ... '2026-09']`)
- `wildcardMonth`: string (e.g. `2026-09`)
- `monthlyWagerCents`: number
- `players`: [ { ownerId: string, displayName: string, contact?: string } ]

### 2) teams
- `_id`: ObjectId
- `mlbId`: number (unique)
- `name`, `shortName`, `division`, `logoUrl`
- `ownerId`: string | null
- `lastUpdated`: Date

### 3) draftSessions (final persisted document)
- `_id`, `leagueId`, `status`: 'placeholder'|'locked'|'in_progress'|'completed'|'cancelled'
- `createdBy`, `createdAt`, `startedAt`, `finishedAt`
- `draftOrder`: [ { orderIndex, ownerId } ]
- `picks`: [ { pickNumber, round, ownerId, teamMlbId, teamName, rawDivisionOdds, rawWildcardOdds, pointsDivision, pointsWildcard, pickedAt, auto: boolean } ]
- `remainingTeams`: [number]
- `snapshotOddsAt`: Date (reference to `oddsCache` snapshot used)
- `audit`: actions array

### 4) draftRuntimeSnapshots (per-round backups)
- `_id`, `draftTempId`, `roundNumber`
- `picks`, `draftOrder`, `availableTeams`, `playersStatus` (ready/socketCount)
- `createdAt`

### 5) standingsCache
- `_id`, `date` (YYYY-MM-DD), `raw` (MLB API response), `lastFetchedAt`

### 6) oddsCache
- `_id`, `source` (e.g. `the-odds-api`), `snapshotAt`, `data` (normalized odds per team), `lastFetchedAt`

### 7) monthlyResults
- `_id`, `month` (YYYY-MM), `season`, `computedAt`, `sourceDraftSessionId`
- `ownerPoints`: [ { ownerId, pointsDecimal } ]
- `winners`: [ { ownerId, moneyCents } ]
- `teamAwards`: per-team breakdown
- `leagueBankPointsChange`, `leagueBankCentsChange`, `audit`

### 8) adminAuth
- `_id`, `hash` (bcrypt), `createdAt`, `rotatedAt?`

## Scoring rules (explicit)

Canonical rules to implement:

- **Draft snapshot:** For each team snapshot `rawDivisionOdds` and `rawWildcardOdds`. Derived points: `points = Math.max(100, Math.abs(parseInt(rawOdds)))`.

- **Monthly scoring (April–September inclusive):**
  - For each division, determine month-end leader(s) from MLB standings.
  - For each leading team T owned by owner O:
    - Single leader: award `pointsDivision` to O.
    - N-way tie: each tied owner receives `pointsDivision / N` (decimal allowed).
    - Unowned teams: no points awarded.
  - Wildcard points: awarded in final regular-season month (September) using same logic.

- **Monthly winners & payouts:**
  - Compute `monthlyPoints` per owner; winners are owners with `monthlyPoints == maxPoints`.
  - Monthly pot (money): `monthlyPotCents = monthlyWagerCents * (numPlayers - winners.length)` (collect only from non-winning players).
  - Per-winner: `perWinnerCents = Math.floor(monthlyPotCents / winners.length)`; leftover cents → `leagueBankCents`.

- **Rounding & precision:** Points allow decimals; money uses integer cents.

---

## Backend API (v1) — endpoints

Return only the fields needed by UI components. Heavy computation runs server-side.

### Public
- `GET /api/v1/league/settings` — returns league settings, players, months.
- `GET /api/v1/cache/status` — `{ oddsLastFetchedAt, standingsLastFetchedAt }`.
- `GET /api/v1/teams` — minimal team list with snapshot points (if available).
- `GET /api/v1/draft/placeholder` — placeholder draft info.
- `GET /api/v1/draft/:id` — persisted `draftSessions` doc.
- `GET /api/v1/monthly-results?month=YYYY-MM` — monthlyResults doc.

### Admin (protected by `ADMIN_TOKEN` header `x-admin-token` or bearer token)
- `POST /api/v1/admin/ingest` — trigger ingest (MLB + Odds), returns status.
- `POST /api/v1/admin/draft/lock` — placeholder: snapshot odds (persist only if `persist=true`).
- `POST /api/v1/admin/compute-monthly?month=YYYY-MM&force=false` — compute and persist `monthlyResults` (idempotent unless `force=true`).
- `POST /api/v1/admin/draft/persist` — force persistence of current runtime draft to `draftSessions`.

## Draft Day realtime design (Socket.IO)

High-level flow (lobby → reveal → in_progress → completed):

- **Auth:** Socket handshake uses JWT; server attaches `userId` to socket.
- **Join:** client emits `draft:join`; server responds `draft:state`.
- **Ready flow:** users toggle `draft:ready`. Draft proceeds to reveal only when all players listed in `leagueSettings.players` are connected and ready.
- **Order reveal:** server shuffles players (Fisher‑Yates) and emits `draft:orderReveal` with `revealEndsAt` (30s).
- **In-progress picks:** picks occur in order; server sets `pickDeadline = now + pickTimeoutSeconds` (default 60). Server broadcasts `draft:timer` and validates `draft:pickAttempt` events.
- **Auto-pick:** on timeout, server selects available team(s) with highest `pointsDivision`; tie → random choice. Pick flagged `auto: true`.
- **Per-round autosave:** after every round (one pick per player), server persists a `draftRuntimeSnapshot` and emits `draft:roundSaved`.
- **Final persist:** when draft completes, server writes `draftSessions` final doc and emits `draft:completed`.

**Important:** if the server restarts mid-draft, the latest `draftRuntimeSnapshot` is used to restore state, but all users must re-Ready to continue.

## Ingestion & caching strategy

- **Goal:** one bulk fetch per source hourly. Cache the raw responses in Mongo and expose `lastFetchedAt` to frontend.
- **Odds ingestion:** fetch from The Odds API using `ODDS_API_KEY`. Normalize and map outcomes to `teamMlbId`, store `raw` and derived `pointsDivision`/`pointsWildcard`.
- **Standings ingestion:** use MLB swagger to fetch standings for specific dates (month-end); store in `standingsCache`.
- **Scheduler:** node-cron (hourly) + `POST /admin/ingest` manual trigger. On 429s/backoff, use stale cache.

## Admin & security

- **Admin token policy:** `ADMIN_TOKEN` env optional. If absent server will autogenerate a secure 32-byte hex token at first-run, hash with bcrypt and store in `adminAuth`. The plain token is printed once to stdout — store it securely.
- **Rotation:** `POST /api/v1/admin/auth/rotate` rotates the token (returns new plain token once).
- **User auth:** implement JWT-based auth for users (recommended). Map users to `leagueSettings.players` by `ownerId`.
- **Rate limits & validation:** use `express-rate-limit`, validate inputs with `zod`/`joi`.

## Frontend (Vue 3 + Chakra UI)

### Pages (MVP)
- Home (league summary)
- Standings (month selector)
- Teams / Team Detail
- Monthly Results
- Draft Day (lobby + live draft)
- Draft Placeholder

### Key components
- PresencePanel, DivisionGrid, TeamCard, DraftOrderModal, Timer, PicksTimeline, CacheBadge

Styling: use Chakra UI Vue; remove Tailwind.

## Docker & deployment

Top-level artifacts:

- `docker-compose.yml` (mongo + server + client)
- `server/Dockerfile` (Node build + dist)
- `client/Dockerfile` (multi-stage Vite build → nginx)
- `.env.example`

Compose outlines and TrueNAS notes are in the `Runbook` below.

## Persistence, backups and autosave policy

- Runtime: in-memory authoritative state for drafts.
- Autosave: after every round, persist `draftRuntimeSnapshot` (one pick per player).
- Final: persist canonical `draftSessions` once at draft completion.
- Recovery: restore from latest snapshot and require users to re-Ready.

## Testing & QA plan

- **Unit tests:** computeMonthly, autoPick, ingest normalization.
- **Integration tests:** Supertest + Jest for API; Socket.IO integration for drafts.
- **E2E:** Playwright for main user flows.
- **Manual QA:** accessibility (axe), failure-mode testing (API 429s) and visual checks.

## Observability & monitoring

- Logging: pino/winston.
- Error tracking: Sentry.
- Health: `GET /api/v1/health`.
- Ingest monitoring: record last success/failure timestamps and surface them in admin UI.

## Migration & rollout strategy

1. Scaffold server & client.
2. Implement ingestion with mocked responses.
3. Rewire client to call server endpoints.
4. Build Draft Day UI with mocked socket runtime.
5. Turn on real ingest and computeMonthly.
6. Migrate styling to Chakra UI and remove Tailwind.
7. Production prep (Atlas, secrets, backups).

## File/folder scaffold and tasks

Top-level structure to create:

```
client/
  package.json, tsconfig.json, Dockerfile
  src/
    main.ts, App.vue, router.ts
    pages/{Home,Standings,MonthlyResults,DraftDay,DraftPlaceholder}.vue
    components/{PresencePanel,DivisionGrid,TeamCard,Timer,PicksTimeline,CacheBadge}.vue
    services/api.ts
    services/socket.ts
    stores/draftStore.ts

server/
  package.json, tsconfig.json, Dockerfile
  src/
    index.ts (bootstrap express & socket.io)
    config/index.ts
    models/{leagueSettings,team,draftSession,draftRuntimeSnapshot,monthlyResult,cache,adminAuth}.ts
    controllers/{public,admin}.ts
    services/{ingest,compute,draft,auth,cache}.ts
    socket/draft.socket.ts
    jobs/hourlyIngest.ts
    utils/{odds-utils,mlb-swagger-client}.ts
    tests/{compute.test.ts,draft.integration.test.ts}

docker-compose.yml
.env.example
README.md (project overview + run instructions)
RULES.md (rules + examples)
```

## Implementation task list (prioritized)

**Phase 0 — scaffolding (1–2 days)**
- TypeScript projects for server & client
- Dockerfiles + compose
- Env config + Mongoose models

**Phase 1 — ingestion & caching (2–3 days)**
- ingest service (Odds API + MLB swagger)
- normalize & cache
- scheduler + `POST /admin/ingest`

**Phase 2 — computeMonthly (1–2 days)**
- implement computeMonthly service (idempotent)
- admin `compute-monthly` endpoint

**Phase 3 — Draft Day runtime (3–5 days)**
- Socket.IO runtime + timers
- per-round autosave snapshots
- auto-pick on timeout
- client Draft Day page

**Phase 4 — frontend migration & polishing (3–7 days)**
- Chakra UI migration
- pages consume backend endpoints

**Phase 5 — CI, E2E, docs (2–3 days)**
- CI pipeline, Playwright tests, finalize docs

Estimated total: ~12–20 days (single developer).

## Runbook: local dev & commands

Prereqs: Docker, Docker Compose, Node 18+, `ODDS_API_KEY`.

1. Copy `.env.example` → `.env` and set values.
2. Start services:

```bash
docker-compose up --build
```

3. Visit:
- Frontend: `http://localhost:3000`
- API: `http://localhost:4000/api/v1`

4. Trigger ingest (admin token required):

```bash
curl -X POST -H "x-admin-token: <token>" http://localhost:4000/api/v1/admin/ingest
```

5. Check cache status:

```bash
curl http://localhost:4000/api/v1/cache/status
```

6. Compute monthly (admin):

```bash
curl -X POST -H "x-admin-token: <token>" "http://localhost:4000/api/v1/admin/compute-monthly?month=2026-04&force=false"
```

## Appendix — API contract examples

**GET /api/v1/league/settings**

```json
{
  "name": "Monte Fantasy Baseball",
  "season": 2026,
  "monthlyWagerCents": 2000,
  "players": [
    { "ownerId": "u1", "displayName": "Alice" },
    { "ownerId": "u2", "displayName": "Bob" }
  ],
  "seasonMonths": ["2026-04","2026-05","2026-06","2026-07","2026-08","2026-09"],
  "wildcardMonth": "2026-09"
}
```

**POST /api/v1/admin/compute-monthly?month=2026-04** — response example

```json
{
  "month": "2026-04",
  "computedAt": "2026-05-01T00:05:00Z",
  "winners": [ { "ownerId": "u2", "moneyCentsAwarded": 3000 } ],
  "ownerPoints": [ { "ownerId": "u2", "points": 1200.5 } ],
  "leagueBankCentsChange": 0
}
```

**Draft snapshot (partial)**

```json
{
  "draftId": "d_abc123",
  "snapshotOddsAt": "2026-03-08T12:34:00Z",
  "snapshot": [
    { "teamMlbId": 146, "rawDivisionOdds": "+1200", "pointsDivision": 1200, "rawWildcardOdds": "+250", "pointsWildcard": 250 }
  ]
}
```

## Handoff checklist

Provide the following to the next engineer/agent:

- This `PROJECT-PLAN.md` file
- Repo backup branch
- `ODDS_API_KEY` in a secure secret store
- MongoDB connection string for dev/staging
- Admin instructions for token rotation and retrieval (server prints on first-run)

## Final notes

This document is intentionally comprehensive to make it easy for another agent to pick up implementation work. No scaffolding or code was added yet — this file is the canonical plan.

When you are ready to proceed with implementation, reply `implement` or `go` and the scaffolding + initial implementation will be created.
