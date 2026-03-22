# Montesano Fantasy Baseball: League Operations Guide (2026)

This document is the normalized operating guide for agents and maintainers. It preserves the 2026 league rules while organizing them for faster decision-making.

## League Intent

- Reward sharp drafting decisions (especially early-round risk/reward).
- Keep scoring team-focused instead of player-event focused.
- Keep payout handling simple by collecting money up front.
- Align tie resolution with MLB tie-break procedures.

## Season Structure and Wagers

- Regular season scoring months: April, May, June, July, August, September.
- March is excluded from monthly winner calculations.
- Monthly wager: $20 per person; monthly winner payout: $60.
- All-Star event is a separate pool: $30 per person; winner payout: $90.
- Playoffs are a separate pool: $50 per person.
- Total annual commitment per person: $200.
- Wagers are collected on draft day and held for end-of-season distribution.

## Regular Season Monthly Winner Logic

- Each drafted team can earn points based on preseason division odds.
- At each month-end (April through September), total points by owner.
- Highest monthly point total wins the month.
- If tied, resolve using tie-break rules in this document.

## Team Point Calculation

Base wager model is fixed at $100 equivalent per team for point calculation.

### 1) Convert odds to base points

- Positive odds (`+X`):

```text
basePoints = 100 * ((X / 100) + 1)
```

- Negative odds (`-Y`):

```text
basePoints = 100 * ((100 / |Y|) + 1)
```

### 2) Apply round-based prorate multiplier

```text
multiplier = (10 - draftRound) / 10
finalPoints = round(basePoints * multiplier)
```

- Earlier picks retain more value; later picks are discounted.
- Round 1 effectively receives no discount.
- Final points are rounded to nearest whole number.

## Tie-Break Rules

### Two-team tie

Apply in order until resolved:

1. Head-to-head record
2. Intradivision record
3. Interdivision record (within same league, outside division)
4. Last half of intra-league games

### Three-team tie

Apply in order until resolved:

1. Combined head-to-head winning percentage among tied teams
2. Intradivision record

No shared division points in ties; follow deterministic MLB-style resolution.

## Wild Card Team Points (End of Season)

Wild card teams (playoff teams that did not win division) are scored only at end of season.

1. Compute average points earned by all division leaders.
2. Wild card team points = 75% of that average.

## All-Star Break Scoring (Separate Competition)

All-Star scoring is independent from regular-season monthly scoring.

### All-Star Game

- Each active-roster All-Star player awards 6 points to the owner of that MLB team.
- If that player is on the winning league (AL/NL), add 6 bonus points.

### Home Run Derby

- Each participant picks one winner candidate.
- Correct winner pick = 40 points.
- If no one picked the champion, award win to the pick that advanced farthest.
- Ties award full 40 points to each tied winner.

## Playoffs Scoring (Separate Competition)

Playoff points reset; regular-season winner is already crowned.

- Wild Card series win: 5 points
- Division Series win: 10 points
- Championship Series win: 20 points
- World Series win: 30 points
- Bonus: +1 for correctly predicting both winner and exact clinching game number.

## Operational Decision Checklist for Agents

When answering scoring or payout questions:

1. Identify context: regular month, all-star, or playoffs.
2. Confirm whether March should be excluded.
3. For regular season, compute base odds points then apply round multiplier.
4. Round final values to nearest whole number.
5. If tie exists, apply tie-break chain exactly in order.
6. Keep wild card scoring as end-of-season only.
7. Do not add special-case player events (no-hitters, records, etc.).

## Canonical Source Note

This guide is normalized from the 2026 rules document and should be treated as the operational reference for agent outputs in this repo.
