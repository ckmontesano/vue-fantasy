# Monte Fantasy Baseball — Full Revamp Plan

This document is an exhaustive implementation and handoff plan for the Monte Fantasy Baseball revamp. It is intended to be the single canonical artifact for any engineer or agent taking over the project. It contains the architecture, data models, API contracts, scoring rules, Draft Day realtime design, caching and ingestion strategy, security, deployment, test plan, timeline, and a file-by-file scaffold plan for implementation.

> WARNING: This repository was replaced with this planning document. The next steps are to follow this plan to implement the server and client scaffolds in TypeScript, wire ingestion, create the Docker-based local environment, and implement comprehensive tests. There are no other files in the repository except this plan.

---

Table of contents
- Overview & goals
- Key decisions and constraints
- System architecture
- Data model (Mongo collections)
- Scoring rules (final)
- Backend API (v1) — endpoints and payloads
- Draft Day realtime design (Socket.IO) — full flow
- Ingestion & caching strategy (MLB & Odds API)
- Admin & security (admin token autogen, auth model)
- Frontend (Vue 3 + Chakra UI) — pages and components
- Docker & deployment (docker-compose, Dockerfiles, TrueNAS notes)
- Persistence, backups, and autosave policy
- Testing & QA plan
- Observability & monitoring
- Migration & rollout strategy
- File/folder scaffold and tasks (detailed)
- Timeline & estimated effort
- Runbook: local dev & commands
- Glossary and references

---

Overview & goals

This revamp consolidates league state server-side and rebuilds the client with Vue 3 and Chakra UI. The primary functional objectives:

- Replace client-heavy MLB & logos calls with a single backend that fetches and caches external data.
- Move persistent league state (standings, teams, owners, odds snapshots, draft sessions, monthly results) into MongoDB via a Node/Express + Mongoose backend.
- Remove localStorage persistence and hardcoded assets from the client; client becomes a UI-only consumer of shaped API endpoints.
- Implement a Draft Day realtime experience where users connect, ready up, and perform a timed draft; draft state is stored in memory and backed up per-round, with final persistence performed once at draft completion.
- Implement precise scoring: teams drafted, not players. Vegas American odds at draft snapshot produce points (Option 2: points = max(100, abs(americanOdds))). Monthly winners are determined by points, while money payouts are computed from `monthlyWager` and number of players who do not tie for first.
- Containerize the stack with docker-compose for local development and TrueNAS-friendly deployment.

Key constraints and decisions (final)

- Tech stack: Node.js + Express (TypeScript), MongoDB (Mongoose), Vue 3 + Vite + TypeScript for client, Chakra UI Vue for styling. Realtime layer: Socket.IO.
- Odds -> points: Option 2. points = max(100, abs(integer(AmericanOdds))). Raw odds string are stored as well (e.g., `+1200` / `-150`).
- Monthly months: inclusive April → September.
- Division ties: if a team tied for first in its division, that team's points are split evenly among tied teams' owners (fractional points allowed). The tied owners each get 1/N of the team’s points.
- Monthly pot money: monthlyPot = monthlyWager * (numberOfPlayers - winnersCount), i.e. collect only from players who are not tied for first. Pot split equally among winners (integer cents); leftover cents go to `leagueBankCents`.
- Unowned teams: yield no points and no money; ties that include unowned teams simply are not credited to anyone.
- Draft Day behavior: lobby with Ready state; random order reveal for 30s; 60s per pick default; on timeout, server auto-picks team with highest division points from available pool (random among ties); autosave snapshots after each round (one round = one pick per player). Final draft persisted at completion.
- Admin auth: shared ADMIN_TOKEN (32-byte hex) — server autogenerates one on first-run if not provided via env; hashed and stored in DB. ADMIN_TOKEN is required for protected admin endpoints.

System architecture

High level components
- Client (Vue 3 + Chakra UI): renders pages, connects via REST to API for static data and to Socket.IO for Draft Day realtime.
- Server (Node + Express + Socket.IO): provides REST API, ingestion worker(s), caching, compute routines, and Socket.IO runtime for drafts.
- MongoDB: single database instance (docker-compose or Atlas). Collections hold canonical data, caches, and draft snapshots.
- External APIs:
  - MLB data via Swagger spec (https://raw.githubusercontent.com/joerex1418/mlb-statsapi-swagger-docs/refs/heads/main/swagger-docs.json) — used for standings and MLB metadata.
  - Odds provider: The Odds API (https://the-odds-api.com). Put API key in `ODDS_API_KEY` (env).

Deployment topology
- Local: docker-compose with services: mongo, server, client (nginx serving built client). Server talks to external APIs, caches results in Mongo.
- Production: similar but use a managed Mongo (Atlas). Keep ODDS_API_KEY and other secrets out of repo.

Data model (Mongo collections)

The plan below shows schema outlines (fields, types, and purpose). Mongoose models will be created accordingly (TypeScript interfaces + Mongoose schemas). Use Decimal128 for precise decimal storage of fractional points where needed, or store as Number with caution.

1) leagueSettings
- _id: ObjectId
- name: string
- season: number
- seasonStart: Date
- seasonEnd: Date
- seasonMonths: [String] // ex: ['2026-04', ..., '2026-09']
- wildcardMonth: String // e.g., '2026-09'
- monthlyWagerCents: number // integer cents
- players: [{ ownerId: string, displayName: string, contact?: string }]
- createdAt, updatedAt

2) teams
- _id: ObjectId
- mlbId: number (unique)
- name: string
- shortName: string
- division: string
- logoUrl: string
- ownerId: string | null
- lastUpdated: Date

3) draftSessions (final persisted document)
- _id: ObjectId
- leagueId: ObjectId
- status: 'placeholder' | 'locked' | 'in_progress' | 'completed' | 'cancelled'
- createdBy: string
- createdAt: Date
- startedAt: Date
- finishedAt: Date
- draftOrder: [{ orderIndex: number, ownerId: string }]
- picks: [ { pickNumber, round, ownerId, teamMlbId, teamName, rawDivisionOdds, rawWildcardOdds, pointsDivision, pointsWildcard, pickedAt, auto: boolean } ]
- remainingTeams: [number]
- snapshotOddsAt: Date (reference to oddsCache snapshot used)
- audit: { createdBy, completedBy, actions: [ { type, time, userId, meta } ] }

4) draftRuntimeSnapshots (per-round backups)
- _id: ObjectId
- draftTempId: string // runtime id
- roundNumber: number
- picks: [pick objects as above]
- draftOrder: [ownerId]
- availableTeams: [teamMlbId]
- playersStatus: [{ ownerId, ready: boolean, socketCount }]
- createdAt: Date

5) standingsCache
- _id: ObjectId
- date: 'YYYY-MM-DD'
- raw: Object // full response from MLB api
- lastFetchedAt: Date

6) oddsCache
- _id: ObjectId
- source: string // 'the-odds-api'
- snapshotAt: Date
- data: [ { teamMlbId, rawDivisionOdds, rawWildcardOdds, parsedDivisionOddsInt, parsedWildcardOddsInt, pointsDivision, pointsWildcard } ]
- lastFetchedAt: Date

7) monthlyResults
- _id: ObjectId
- month: 'YYYY-MM'
- season: number
- computedAt: Date
- sourceDraftSessionId: ObjectId
- ownerPoints: [ { ownerId, pointsDecimal } ]
- winners: [ { ownerId, moneyCents } ]
- teamAwards: [ { teamMlbId, ownersAwarded: [ { ownerId, pointsAwarded } ], reason: 'division'|'wildcard' } ]
- leagueBankPointsChange: number
- leagueBankCentsChange: number
- audit: { computedBy, forceFlag }

8) adminAuth
- _id: ObjectId
- hash: string (bcrypt hash of token)
- createdAt: Date
- rotatedAt?: Date

Scoring rules (explicit)

This is the canonical ruleset to be implemented exactly:

- Draft snapshot:
  - For each team, snapshot two raw American odds strings: `rawDivisionOdds` and `rawWildcardOdds`.
  - Derived integer points are computed: `points = Math.max(100, abs(parseInt(rawOdds)))`. Save both raw strings and the derived points.

- Monthly scoring (April–September inclusive):
  - For each division, determine the ranked leader(s) at month-end using MLB standings.
  - For each leading team T that is owned by owner O:
    - If there is a single leader: award `pointsDivision` to owner O.
    - If N teams tie for first in the division: each owner receives `pointsDivision / N` points (store decimals).
    - If a team is unowned, no owner gets those points (they are not reallocated).
  - Wildcard points are awarded only in the final regular-season month (September) to wildcard qualifiers; same tie logic applies.

- Monthly winners & payouts:
  - Compute `monthlyPoints` for each owner as sum of their awarded points in that month.
  - Find `maxPoints`. Winners = owners where `monthlyPoints == maxPoints`.
  - Monthly pot money calculation: `monthlyPotCents = monthlyWagerCents * (numPlayers - winners.length)`.
    - This collects `monthlyWager` from every non-winning player only.
  - Money per winner: `perWinnerCents = Math.floor(monthlyPotCents / winners.length)`.
  - Leftover cents (due to integer division) go to `leagueBankCents`.

- Rounding & precision:
  - Points: decimal values allowed; store as Number or Decimal128.
  - Money: store as integer cents; rounding by floor when dividing between winners.

- Edge cases:
  - If winners.length == numPlayers (everyone tied), monthlyPotCents == 0 -> no money exchanges.
  - Missing snapshot odds => points = 0.

Backend API (v1) — endpoints

Design principle: endpoints return only fields required by front-end components; heavy work like computeMonthly is done server-side. API is versioned at `/api/v1`.

Public endpoints

- GET /api/v1/league/settings
  - Response: { name, season, monthlyWagerCents, players: [{ ownerId, displayName }], seasonMonths, wildcardMonth }

- GET /api/v1/cache/status
  - Response: { oddsLastFetchedAt, standingsLastFetchedAt }

- GET /api/v1/teams
  - Response: [ { mlbId, name, division, ownerId|null, ownerName|null, logoUrl, snapshotPointsDivision?, snapshotPointsWildcard? } ]

- GET /api/v1/draft/placeholder
  - Response: { draftState: "placeholder", message, exampleSnapshot: [ ... ] }

- GET /api/v1/draft/:id
  - Response: draftSessions document (final persisted) or 404

- GET /api/v1/monthly-results?month=YYYY-MM
  - Response: monthlyResults document

Admin endpoints (protected by ADMIN_TOKEN via header `x-admin-token` or `Authorization: Bearer <token>`)

- POST /api/v1/admin/ingest
  - Trigger on-demand ingest of MLB standings & Odds API. Returns ingest status and lastFetched timestamps. Auth required.

- POST /api/v1/admin/draft/lock (placeholder for now)
  - Placeholder endpoint; will accept a snapshot payload or instruct server to fetch odds and snapshot them. Initially returns planned effect and does not persist unless admin sets a `persist=true` flag.

- POST /api/v1/admin/compute-monthly?month=YYYY-MM&force=false
  - Compute monthly winners & payouts for a given month; idempotent unless `force=true`. Persists monthlyResults and returns the document.

- POST /api/v1/admin/draft/persist
  - Force persistence of current runtime draft to draftSessions (admin-only). Use for recovery or manual finalization.

Draft Day realtime design (Socket.IO)

Overview
- Socket.IO provides authentication via JWT in handshake. The draft runtime is authoritative in memory on the single server process. Per-round autosave snapshots are written to Mongo after each completed round.

Connection & authentication
- Client connects to server with Socket.IO handshake including a JWT token. Server verifies token and attaches user info to the socket.
- On connection, client emits `draft:join` with optional `draftId` (if joining an existing draft session) and server responds with `draft:state` (runtime state or lobby state).

Presence, Ready flow, and start
- Players must all click `Ready` to begin. The server ensures all `leagueSettings.players` are present and have `ready == true` before moving into the order reveal phase.
- No admin Start button required; admin retains override controls.
- Progression: `lobby` -> when all ready -> `reveal` (30s) -> `in_progress`.

Draft order reveal
- Server shuffles players (Fisher-Yates) to determine `draftOrder`. It broadcasts `draft:orderReveal` with `revealEndsAt` (30s from now).

Pick flow & timers
- Each pick: pickTimeoutSeconds (default 60) configurable per-draft.
- Server sets a deadline timestamp for each pick and emits `draft:timer` messages so clients can display countdowns.
- Only the current pick owner may perform `draft:pickAttempt`.

Auto-pick on timeout
- If timer expires, server chooses the available team with maximum `pointsDivision` (from draft snapshot). If multiple teams tie in points, choose randomly among those ties.
- The pick is flagged `auto: true` and broadcast as `draft:pickAccepted`.

Double-click UX
- Client handles double-click: first click highlights team; second click sends `draft:pickAttempt` to server.
- Server validates pick is allowed (correct turn, team available); accepts or rejects accordingly.

Per-round autosave (backup)
- After N picks equal to the number of players (one full round), server writes a `draftRuntimeSnapshot` document capturing runtime state. Server emits `draft:roundSaved` with snapshot ID.
- This policy reduces loss to at most one round of picks if server crashes and allows reliable recovery.

Finalization and persistence
- After all picks complete or admin ends draft, server composes `draftSessions` final doc and persists it. After persistence, server emits `draft:completed` with finalDraftSessionId.
- Optionally, server may apply team ownership changes to the `teams` collection (this is separate and must be explicitly enabled; best practice: record ownership in `draftSessions` and then separately run a one-time migration to apply owners to `teams` when appropriate).

Server restart and recovery
- On restart, server checks for the most recent `draftRuntimeSnapshot` for any in-progress draft and restores runtime state if present. All clients must re-join and re-Ready to proceed (explicit requirement: users must Ready up again after server restart to avoid surprises).

Admin overrides
- Admin can force picks, undo picks, pause/resume draft, unlock after completion. All admin actions are audited in `draftSessions.audit`.

Ingestion & caching strategy

Design goals
- Make a single bulk fetch per source on an hourly schedule. Cache raw responses in `oddsCache` and `standingsCache` collections in Mongo. Expose timestamps to frontend so users see data staleness.
- Respect external API rate-limits using exponential backoff and retries. Use the cached data as fallback when external calls fail.

Odds ingestion (The Odds API)
- Use the provided `ODDS_API_KEY` from env.
- Fetch markets that include division and wildcard outcome lines per team (bulk endpoint). Normalize results to map to MLB team IDs (mlbId). Save raw string (e.g., `+1200`) and derived parsed integer (abs value, minimum 100) in `oddsCache.data` along with `pointsDivision` and `pointsWildcard`.
- Upsert team's `pointsDivision` and `pointsWildcard` to a draft snapshot if `admin/draft/lock` is invoked.

Standings ingestion (MLB API via swagger)
- Use the MLB swagger to get standings for a specific date (month-end). Cache the response in `standingsCache` keyed by date.
- Use standings to determine division leaders and wildcard qualifiers.

Scheduler & manual triggers
- A scheduler (node-cron or agenda) runs hourly to update `oddsCache` and `standingsCache`.
- Admin endpoint `POST /api/v1/admin/ingest` triggers manual ingestion.

Cache TTL and frontend visibility
- Cache TTL: 1 hour. Store `lastFetchedAt` on each cache document and expose via `GET /api/v1/cache/status`.
- Frontend displays cache timestamps (e.g., "Odds: 12m ago") prominently on pages where data is used.

Admin & security

Admin token policy
- `ADMIN_TOKEN` may be set via env for convenience. If absent, server autogenerates a secure 32-byte hex token on first-run, hashes it with bcrypt and stores it in `adminAuth` collection; server prints the token once to stdout so admin can copy it.
- Admin endpoints require the token in `x-admin-token` header or `Authorization: Bearer <token>`.
- Rotation: admin may call `POST /api/v1/admin/auth/rotate` to rotate the token; server returns the new token once in response and stores hashed version.

User authentication
- For Draft Day realtime and per-user actions, implement JWT-based auth with a simple Users collection (email/displayName/passwordHash). For initial MVP, owner records can be simple named records and a minimal login flow can be added.
- The socket handshake uses JWT and server attaches `userId` to socket.

Rate-limiting & hardening
- Rate-limit admin ingestion endpoints to prevent abuse. Use express-rate-limit.
- Sanitize all inputs. Validate requests with zod/joi.

Frontend (Vue 3 + Chakra UI) — pages and components

Pages (minimum MVP)
- Home — summary of league, standings, upcoming draft info, cache timestamps.
- Standings — view month selector, show division standings for given date, use `GET /api/v1/standings?date=` (implemented server-side via cache).
- Teams / Team Detail — show team info, owner, draft snapshot points, logos.
- Monthly Results — show monthlyResults per month, owner points, winners, money awarded.
- Draft Day — lobby + live draft UI (real-time via Socket.IO). This page includes Ready toggle, presence panel, DivisionsGrid, DraftOrderModal, Timer, PicksTimeline, AdminControls.
- Draft Placeholder — a page for when draft features are planned but not locked in (used early in rollout).

Key components
- PresencePanel — displays all league players and their Ready/connected status.
- DivisionGrid — lists teams per division with TeamCard components.
- TeamCard — shows logo, name, raw odds, derived points; handles click/double-click UX for picks.
- DraftOrderModal — shows reveal of draft order with 30s countdown.
- Timer — shows seconds left for current pick and visual progress.
- PicksTimeline — live feed of picks with owner labels and `auto` flag for auto-picks.
- CacheBadge — shows stash timestamps for odds and standings.

Styling
- Use Chakra UI Vue for consistent component primitives and tokens. Remove Tailwind from the original codebase entirely.

Docker & deployment (docker-compose)

Top-level files to be provided in scaffold:
- docker-compose.yml
- server/Dockerfile
- client/Dockerfile (multi-stage: build with node -> serve with nginx)
- .env.example

Compose services
- mongo: image: mongo:6 — named volume for persistence
- server: build ./server — port 4000, env: MONGODB_URI=mongodb://mongo:27017/monte, ODDS_API_KEY from env; depends_on: mongo
- client: build ./client — port 3000:80, depends_on: server. Vite devserver is optional for dev compose.

TrueNAS notes
- Map compose volumes to host dataset paths. Ensure permissions for Docker user to write volumes.

Persistence, backups, and autosave policy

- Draft runtime is in-memory; per-round `draftRuntimeSnapshot` is persisted after each round (one round = picks == numberOfPlayers).
- Final `draftSessions` is persisted once at draft completion.
- Recovery: on server boot, if recent `draftRuntimeSnapshot` exists for an in-progress draft, server will restore runtime state but require users to re-Ready to confirm before proceeding (explicit requirement to avoid surprise continuity after restart).
- Data backups: advise nightly MongoDB dumps (or Atlas automated backups in production).

Testing & QA plan

Unit tests
- ComputeMonthly unit tests covering tie splits, wildcard month, unowned teams, money allocation and rounding to `leagueBankCents`.
- AutoPick algorithm tests to ensure highest-points selection and tie randomization.
- Ingest normalization tests for odds parsing.

Integration tests
- Supertest + Jest for API routes: ingest, compute-monthly, admin endpoints, cache status.
- Socket.IO integration tests: simulate multiple clients joining, readying, picks (including timeouts and auto-picks), per-round snapshot creation, persistence of final draft.

End-to-end tests
- Playwright tests for pages: Draft Day lobby flow, double-click pick UX, Monthly Results verification.

Manual QA
- Visual checks for Chakra UI theme, accessibility checks via axe.
- Rate-limit & failure mode checks (simulate API 429s, stale cache fallback).

Observability & monitoring

- Logging: structured logs (pino) with TRACE/DEBUG/INFO/ERROR levels.
- Error reporting: Sentry integration for server.
- Health endpoints: `GET /api/v1/health` returning service status and last ingestion timestamps.
- Cron job monitoring: record last successful ingestion and failures in `cacheMetadata` with alerting.

Migration & rollout strategy

1. Feature branch & backups: this repo is already backed up on another branch per user.
2. Scaffold server and client directories in repo root.
3. Implement server ingestion & caching with mock responses to start.
4. Rewire client to call server endpoints and remove direct MLB/odds calls.
5. Create Draft Day page with placeholder UI and socket hooks using mocked runtime. Add auto-pick + autosave later.
6. Turn on real ingest and wire to The Odds API with `ODDS_API_KEY`.
7. Add computeMonthly implementation and run in staging; validate against sample data.
8. Remove Tailwind references and finalize Chakra UI migration.
9. Production prep: move Mongo to Atlas, secure env vars, and set up backups.

File/folder scaffold and tasks (developer checklist)

Top-level structure to create:

- client/
  - package.json, tsconfig.json, Dockerfile
  - src/
    - main.ts, App.vue, router.ts
    - pages/{Home,Standings,MonthlyResults,DraftDay,DraftPlaceholder}.vue
    - components/{PresencePanel,DivisionGrid,TeamCard,Timer,PicksTimeline,CacheBadge}.vue
    - services/api.ts
    - services/socket.ts
    - stores/draftStore.ts

- server/
  - package.json, tsconfig.json, Dockerfile
  - src/
    - index.ts (bootstrap express & socket.io)
    - config/index.ts
    - models/{leagueSettings,team,draftSession,draftRuntimeSnapshot,monthlyResult,cache,adminAuth}.ts
    - controllers/{public,admin}.ts
    - services/{ingest,compute,draft,auth,cache}.ts
    - socket/draft.socket.ts
    - jobs/hourlyIngest.ts
    - utils/{odds-utils,mlb-swagger-client}.ts
    - tests/{compute.test.ts,draft.integration.test.ts}

- docker-compose.yml
- .env.example
- README.md (project overview + run instructions)
- RULES.md (complete rules with examples)

Implementation task list (prioritized)

Phase 0 — scaffolding (1–2 days)
- Initialize TypeScript projects for server & client
- Add Dockerfiles and compose
- Set up environment variable configuration
- Create Mongoose models and TypeScript interfaces

Phase 1 — ingestion & caching (2–3 days)
- Implement ingest.service to fetch The Odds API and MLB standings
- Normalize and store in `oddsCache` and `standingsCache`
- Provide `GET /api/v1/cache/status` and `POST /api/v1/admin/ingest` endpoints
- Implement hourly scheduler

Phase 2 — computeMonthly & monthlyResults (1–2 days)
- Implement compute.service.computeMonthly with idempotent behavior
- Create POST admin endpoint to compute month and persist results
- Add unit tests for computeMonthly

Phase 3 — Draft Day runtime (3–5 days)
- Implement socket/draft.socket.ts and services/draft.service.ts
- Implement per-round autosave snapshots to DB
- Implement auto-pick on timeout logic
- Implement client Draft Day page and components (Ready flow, order reveal, pick timer, double-click UX)
- Add integration tests for socket flow

Phase 4 — frontend migration & polishing (3–7 days)
- Replace Tailwind/styling with Chakra UI Vue components
- Update pages to consume new backend endpoints and display cache timestamps
- Implement Monthly Results page and Team detail pages

Phase 5 — CI, E2E tests, docs and finalization (2–3 days)
- Add CI pipeline for tests
- Add Playwright e2e tests for main flows
- Finalize README.md and RULES.md
- Prepare production deployment instructions

Estimated total time: 12–20 days (single developer), variable by team familiarity and polish.

Runbook: local dev & commands

Prereqs: Docker & Docker Compose, Node 18+, a valid `ODDS_API_KEY` value.

1. Copy `.env.example` to `.env` and set values (do NOT commit your real keys).
2. Start services:

```bash
# Build and start server, client and mongo
docker-compose up --build
```

3. Access services
- Frontend: http://localhost:3000
- API: http://localhost:4000/api/v1

4. Trigger an initial ingest (admin token required):

```bash
curl -X POST -H "x-admin-token: <token>" http://localhost:4000/api/v1/admin/ingest
```

5. Check cache status:

```bash
curl http://localhost:4000/api/v1/cache/status
```

6. Admin compute monthly (example):

```bash
curl -X POST -H "x-admin-token: <token>" "http://localhost:4000/api/v1/admin/compute-monthly?month=2026-04&force=false"
```

Observability & maintenance

- Logs: server logs to stdout and files in container. Configure pino/winston with transport to file.
- Health: GET /api/v1/health
- Backups: schedule mongodump in TrueNAS or use MongoDB Atlas snapshot backups.
- Secrets: store ODDS_API_KEY and ADMIN_TOKEN (optional) in TrueNAS secrets or environment variables for the container.

Appendix — API contract examples

1) GET /api/v1/league/settings

Response (example JSON):

```json
{
  "name": "Monte Fantasy Baseball",
  "season": 2026,
  "monthlyWagerCents": 2000,
  "players": [
    { "ownerId": "u1", "displayName": "Alice" },
    { "ownerId": "u2", "displayName": "Bob" },
    { "ownerId": "u3", "displayName": "Charlie" },
    { "ownerId": "u4", "displayName": "Dana" }
  ],
  "seasonMonths": ["2026-04","2026-05","2026-06","2026-07","2026-08","2026-09"],
  "wildcardMonth": "2026-09"
}
```

2) POST /api/v1/admin/compute-monthly?month=2026-04

Response (example):

```json
{
  "month": "2026-04",
  "computedAt": "2026-05-01T00:05:00Z",
  "winners": [ { "ownerId": "u2", "moneyCentsAwarded": 3000 } ],
  "ownerPoints": [ { "ownerId": "u2", "points": 1200.5 }, ... ],
  "leagueBankCentsChange": 0
}
```

3) Draft snapshot document (part of draftSessions)

```json
{
  "draftId": "d_abc123",
  "snapshotOddsAt": "2026-03-08T12:34:00Z",
  "snapshot": [
    { "teamMlbId": 146, "rawDivisionOdds": "+1200", "pointsDivision": 1200, "rawWildcardOdds": "+250", "pointsWildcard": 250 },
    ...
  ]
}
```

Handoff checklist

When handing off to another agent/engineer, provide the following:
- This `PROJECT-PLAN.md` document (this file)
- Access to repository backup branch (you indicated a backup exists)
- ODDS_API_KEY (in a secure secret store)
- MongoDB connection string for dev/staging (or use docker-compose defaults)
- Admin instruction about token rotation and how to get the autogen token on first run (server prints on startup)

Final notes

This document is intentionally comprehensive to make it easy for another agent to pick up implementation work. The next command I will perform (per your instruction) was to delete all files in the repository and replace them with this plan. That has been completed. No other code, scaffolding, or changes have been added.

When you are ready for the actual scaffold and implementation, the next steps are:
1. Confirm environment preferences (TypeScript confirmed). 2. Confirm you want authentication (JWT) implemented now (recommended). 3. Reply "implement" or "go" and I will create the `server/` and `client/` TypeScript scaffolds, Dockerfiles, docker-compose and initial endpoints + draft runtime.

