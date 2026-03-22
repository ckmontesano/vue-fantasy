# Agent Workflows: Efficient MLB Data Retrieval

This document captures proven API patterns for this repo, based on:

- Historical pre-archive implementation patterns (`e913fe9`, `e327f43`)
- Current Swagger contract in `docs/api/swagger-docs.json`
- Live endpoint validation on 2026-03-22

## Why This Exists

Earlier versions of the app made broad or repeated API calls. For agent work, we want predictable, low-payload, low-call-count retrieval.

## Workflow 1: Standings Snapshot for Monthly Scoring

### Goal

Get all AL/NL division standings for a specific date with only fields needed for league scoring and display.

### Best Endpoint

- `GET /v1/standings`

### Efficient Query Pattern

```text
https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&sportId=1&season=YYYY&date=YYYY-MM-DD&fields=records,league,id,name,division,id,name,teamRecords,team,id,name,divisionLeader,wins,losses,winningPercentage,wildCardRank
```

### Why This Is Efficient

- One call for both leagues (`leagueId=103,104`) instead of separate AL and NL requests.
- `date` allows historical month-end snapshots without local post-filtering.
- `fields` substantially reduces payload size.

Observed payload (2025-08-01 sample):

- Full response: ~80,448 bytes
- Field-scoped response: ~32,419 bytes

### Normalized Output Keys

Use a stable internal shape for downstream scoring logic:

- `leagueId`, `leagueName`
- `divisionId`, `divisionName`
- `teamId`, `teamName`
- `wins`, `losses`, `winningPercentage`
- `divisionLeader`, `wildCardRank`

## Workflow 2: All-Star Roster Ownership Points (No N+1 Calls)

### Historical Inefficiency

Commit `e327f43` enriched All-Star players with per-player lookups, which can produce large N+1 fan-out (1 feed call + one `people` and one `teams` call per player).

### Goal

Map All-Star players to MLB team IDs, then to league and fantasy owner, using minimal calls and payload.

### Efficient 3-Call Strategy

1) Pull All-Star game player IDs from live feed (field-scoped):

```text
https://statsapi.mlb.com/api/v1.1/game/GAME_PK/feed/live?fields=gameData,players,id,fullName
```

2) Fetch all player team mappings in one batched call:

```text
https://statsapi.mlb.com/api/v1/people?personIds=ID1,ID2,...&hydrate=currentTeam&fields=people,id,fullName,currentTeam,id,name
```

3) Fetch season team-to-league lookup once:

```text
https://statsapi.mlb.com/api/v1/teams?sportIds=1&season=YYYY&fields=teams,id,name,league,id,name
```

Then join locally:

- `player.id -> currentTeam.id`
- `currentTeam.id -> league + teamName`
- `currentTeam.id -> fantasy owner` (from local league ownership map)

### Why This Is Efficient

- Replaces per-player requests with a single batched `personIds` request.
- Removes repeated team lookups by building one team map.
- Field scopes keep payload very small.

Observed payload examples:

- Full game feed (`/feed/live`): ~897,171 bytes
- Field-scoped feed: ~3,588 bytes

## Workflow 3: Daily Game Slate for Reference Views

### Goal

Fetch daily schedule with only game IDs, status, teams, and score.

### Efficient Query Pattern

```text
https://statsapi.mlb.com/api/v1/schedule/?sportId=1&date=YYYY-MM-DD&fields=dates,date,games,gamePk,gameDate,status,abstractGameState,detailedState,teams,home,away,team,id,name,score,venue,id,name
```

Observed payload (2025-08-01 sample):

- Full response: ~19,615 bytes
- Field-scoped response: ~4,478 bytes

## Tie-Break Data Note

League tie-breaks follow MLB-style ordering (see `docs/league-context.md`). If standings response does not include enough split detail for a tie scenario, use a targeted follow-up call sequence rather than broad season pulls.

Recommended fallback order:

1. Check standings-level indicators first.
2. Pull narrowly scoped schedule/game results only for tied teams and needed window.
3. Compute tie-break steps in rule order and cite assumptions.

## Guardrails for Agent Answers

- Always scope by `season` and `date` when historical snapshots are needed.
- Prefer one endpoint with tight `fields` over multiple broad calls.
- Avoid `hydrate` unless it replaces multiple endpoint calls.
- Return both IDs and names in normalized outputs.
- Cite `docs/league-context.md` section names whenever scoring logic is applied.
