# Agent Operating Notes

This file is the primary guidance for coding/research agents working in this repository.

## Canonical Context Files

- League rules and scoring behavior: `docs/league-context.md`
- Practical API workflows: `docs/agent-workflows.md`
- MLB StatsAPI Swagger definition: `docs/api/swagger-docs.json`

Use these as the first source of truth before inferring behavior.

## First 60-Second Workflow

1. Read `docs/league-context.md` for scoring/payout constraints.
2. Read `docs/agent-workflows.md` for proven endpoint patterns.
3. Confirm endpoint contract in `docs/api/swagger-docs.json`.
4. Make the smallest call possible (`fields`, narrow date/team scope).
5. Normalize output and cite the exact league rule section when relevant.

## Repo Context

- This project is currently an offline/archive-oriented Vue app.
- New API-oriented helper work should still be documented clearly and avoid unnecessary runtime coupling.
- If a league answer depends on assumptions, state assumptions explicitly and cite the relevant section from `docs/league-context.md`.

## MLB StatsAPI Usage Quick Reference

### Base URL and Versioning

- Runtime base URL: `https://statsapi.mlb.com/api`
- Common versions in this Swagger: `/v1` and `/v1.1`
- Important: Swagger paths in `docs/api/swagger-docs.json` are versioned (for example `/v1/schedule/`). Build full runtime URLs by prepending `/api`.

### High-Value Endpoints

- Schedule: `GET /v1/schedule/`
  - Typical params: `date`, `startDate`, `endDate`, `sportId`, `leagueId`, `teamId`, `hydrate`, `fields`
- Standings: `GET /v1/standings`
  - Typical params: `leagueId`, `season`, `date`, `standingsTypes`, `hydrate`, `fields`
- Teams list/details:
  - `GET /v1/teams`
  - `GET /v1/teams/{teamId}`
- Team roster:
  - `GET /v1/teams/{teamId}/roster`
  - Optional `rosterType`, `season`, `date`
- Live game feed:
  - `GET /v1.1/game/{gamePk}/feed/live`
  - Optional `timecode`, `hydrate`, `fields`
- Game details:
  - `GET /v1/game/{gamePk}/boxscore`
  - `GET /v1/game/{gamePk}/linescore`
  - `GET /v1/game/{gamePk}/playByPlay`
- Stats and leaders:
  - `GET /v1/stats`
  - `GET /v1/stats/leaders`
- Player profile:
  - `GET /v1/people/{personId}`

## Efficient Call Patterns

- Start from the question, then choose the smallest endpoint that can answer it.
- Always scope by time/team/league first (`date`, `startDate`, `endDate`, `season`, `teamId`, `leagueId`).
- Use `fields` aggressively to reduce payload size for agent processing.
- Use `hydrate` only when nested data is truly required.
- Prefer one targeted call over broad pulls plus local filtering.
- For live game polling, use `timecode` (when available) to reduce re-fetch cost.

## Response Normalization for Agents

- Normalize output into stable keys before downstream logic (for example: `gamePk`, `gameDate`, `homeTeamId`, `awayTeamId`, `status`).
- Return both IDs and human-readable names where possible.
- Preserve raw source values for odds/scoring workflows; apply league formulas only after normalization.

## Agent Runbook (Copy/Paste Templates)

Use these URL templates for fast iteration. Replace bracketed values.

```text
# Daily schedule (single date)
https://statsapi.mlb.com/api/v1/schedule/?sportId=1&date=YYYY-MM-DD

# Date-range schedule
https://statsapi.mlb.com/api/v1/schedule/?sportId=1&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

# Standings snapshot
https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=YYYY

# Team list for season
https://statsapi.mlb.com/api/v1/teams?sportIds=1&season=YYYY

# Team roster (active/default)
https://statsapi.mlb.com/api/v1/teams/TEAM_ID/roster?season=YYYY

# Team roster (specific roster type)
https://statsapi.mlb.com/api/v1/teams/TEAM_ID/roster/ROSTER_TYPE?season=YYYY

# Live game feed
https://statsapi.mlb.com/api/v1.1/game/GAME_PK/feed/live

# Boxscore
https://statsapi.mlb.com/api/v1/game/GAME_PK/boxscore

# League leaders
https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=homeRuns,rbi,battingAverage&season=YYYY&sportId=1

# Generic stats lookup
https://statsapi.mlb.com/api/v1/stats?stats=season&group=hitting&season=YYYY&sportIds=1
```

## If Uncertain

- Prefer explicit assumptions over silent guesses.
- Quote the exact rule section from `docs/league-context.md` that drives the answer.
- If API contract uncertainty exists, inspect `docs/api/swagger-docs.json` before proposing code.

## Assumption + Citation Template

Use this structure in league answers when any input is missing or ambiguous:

```text
Assumptions:
- <assumption 1>
- <assumption 2>

Rule Basis:
- docs/league-context.md:<section-title>

Outcome:
- <result using those assumptions>
```
