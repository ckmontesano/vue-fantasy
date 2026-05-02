import { SEASON } from "@/data/season-2026.js";
import getMlbStandings from "@/scripts/mlb-standings.js";

const ALL_STAR_CACHE_KEY = `all-star-break-${SEASON}`;
const ALL_STAR_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function readCachedAllStarBreakData() {
  const cachedValue = localStorage.getItem(ALL_STAR_CACHE_KEY);

  if (!cachedValue) {
    return null;
  }

  try {
    const cached = JSON.parse(cachedValue);

    if (!cached?.fetchedAt || !cached?.payload) {
      return null;
    }

    if (Date.now() - cached.fetchedAt > ALL_STAR_CACHE_TTL_MS) {
      return null;
    }

    return cached.payload;
  } catch {
    return null;
  }
}

function writeCachedAllStarBreakData(payload) {
  localStorage.setItem(
    ALL_STAR_CACHE_KEY,
    JSON.stringify({
      fetchedAt: Date.now(),
      payload,
    }),
  );
}

function getOwnerByTeamId(teamId, standings) {
  for (const league of Object.values(standings || {})) {
    for (const division of Object.values(league)) {
      for (const teamRecord of division.standings || []) {
        if (teamRecord.team.id === teamId) {
          return teamRecord.team.owner || "Undrafted";
        }
      }
    }
  }

  return "Undrafted";
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}: ${url}`);
  }

  return response.json();
}

async function findAllStarGame() {
  const scheduleUrl = new URL("https://statsapi.mlb.com/api/v1/schedule");

  scheduleUrl.searchParams.set("sportId", "1");
  scheduleUrl.searchParams.set("season", String(SEASON));
  scheduleUrl.searchParams.set("startDate", `${SEASON}-07-01`);
  scheduleUrl.searchParams.set("endDate", `${SEASON}-07-31`);
  scheduleUrl.searchParams.set("gameType", "A");
  scheduleUrl.searchParams.set(
    "fields",
    [
      "dates",
      "games",
      "gamePk",
      "gameDate",
      "officialDate",
      "teams",
      "away",
      "team",
      "id",
      "name",
      "isWinner",
      "home",
      "status",
      "detailedState",
      "abstractGameState",
      "seriesDescription",
    ].join(","),
  );

  const schedule = await fetchJson(scheduleUrl.toString());
  const games = schedule.dates?.flatMap((date) => date.games || []) || [];

  return games[0] || null;
}

function buildRosterAssignments(feed) {
  const assignments = new Map();
  const awayPlayers = Object.values(feed.liveData?.boxscore?.teams?.away?.players || {});
  const homePlayers = Object.values(feed.liveData?.boxscore?.teams?.home?.players || {});

  for (const player of awayPlayers) {
    if (player?.person?.id) {
      assignments.set(player.person.id, "American League");
    }
  }

  for (const player of homePlayers) {
    if (player?.person?.id) {
      assignments.set(player.person.id, "National League");
    }
  }

  return assignments;
}

function getWinningLeague(game) {
  if (game?.teams?.away?.isWinner) {
    return "American League";
  }

  if (game?.teams?.home?.isWinner) {
    return "National League";
  }

  return null;
}

export async function getAllStarBreakData({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = readCachedAllStarBreakData();

    if (cached) {
      return cached;
    }
  }

  const [{ standings: mlbStandings }, allStarGame] = await Promise.all([
    getMlbStandings(),
    findAllStarGame(),
  ]);

  if (!allStarGame?.gamePk) {
    const emptyPayload = {
      mlbStandings,
      allStarPlayers: [],
      ownerPoints: {},
      winningLeague: null,
      gameDate: null,
    };

    writeCachedAllStarBreakData(emptyPayload);
    return emptyPayload;
  }

  const feedUrl = new URL(`https://statsapi.mlb.com/api/v1.1/game/${allStarGame.gamePk}/feed/live`);

  feedUrl.searchParams.set(
    "fields",
    [
      "gameData",
      "players",
      "id",
      "fullName",
      "liveData",
      "boxscore",
      "teams",
      "away",
      "players",
      "person",
      "id",
      "home",
      "players",
      "person",
      "id",
    ].join(","),
  );

  const feed = await fetchJson(feedUrl.toString());
  const rosterAssignments = buildRosterAssignments(feed);
  const personIds = Array.from(rosterAssignments.keys());

  if (personIds.length === 0) {
    const emptyPayload = {
      mlbStandings,
      allStarPlayers: [],
      ownerPoints: {},
      winningLeague: getWinningLeague(allStarGame),
      gameDate: allStarGame.officialDate || null,
    };

    writeCachedAllStarBreakData(emptyPayload);
    return emptyPayload;
  }

  const peopleUrl = new URL("https://statsapi.mlb.com/api/v1/people");
  peopleUrl.searchParams.set("personIds", personIds.join(","));
  peopleUrl.searchParams.set("hydrate", "currentTeam");
  peopleUrl.searchParams.set(
    "fields",
    "people,id,fullName,currentTeam,id,name",
  );

  const teamsUrl = new URL("https://statsapi.mlb.com/api/v1/teams");
  teamsUrl.searchParams.set("sportIds", "1");
  teamsUrl.searchParams.set("season", String(SEASON));
  teamsUrl.searchParams.set("fields", "teams,id,name,league,id,name");

  const [peopleData, teamsData] = await Promise.all([
    fetchJson(peopleUrl.toString()),
    fetchJson(teamsUrl.toString()),
  ]);

  const teamsById = new Map((teamsData.teams || []).map((team) => [team.id, team]));
  const winningLeague = getWinningLeague(allStarGame);
  const ownerPoints = {};

  const allStarPlayers = (peopleData.people || [])
    .filter((person) => person.currentTeam?.id)
    .map((person) => {
      const currentTeam = teamsById.get(person.currentTeam.id);
      const asgTeamName = rosterAssignments.get(person.id);
      const owner = getOwnerByTeamId(person.currentTeam.id, mlbStandings);
      const pointsAwarded = asgTeamName && asgTeamName === winningLeague ? 12 : 6;

      ownerPoints[owner] = (ownerPoints[owner] || 0) + pointsAwarded;

      return {
        id: person.id,
        fullName: person.fullName,
        teamId: person.currentTeam.id,
        teamName: person.currentTeam.name,
        teamLeagueName: currentTeam?.league?.name || null,
        asgTeamName,
        owner,
        pointsAwarded,
      };
    })
    .sort((left, right) => {
      if (left.asgTeamName === right.asgTeamName) {
        return left.teamName.localeCompare(right.teamName) || left.fullName.localeCompare(right.fullName);
      }

      return left.asgTeamName.localeCompare(right.asgTeamName);
    });

  const payload = {
    mlbStandings,
    allStarPlayers,
    ownerPoints,
    winningLeague,
    gameDate: allStarGame.officialDate || null,
  };

  writeCachedAllStarBreakData(payload);

  return payload;
}
