// allstar-break-logic.js
// Handles fetching, enriching, and caching All-Star Game player/team/owner data and points
import axios from "axios";
import getMlbStandings from "@/scripts/mlb-standings.js";
const MLB_STANDINGS_KEY = "mlbStandingsCache";
const MLB_STANDINGS_EXPIRATION = 60 * 60 * 1000; // 1 hour in ms

const ASG_ROSTER_KEY = "allStarRoster";
const ASG_POINTS_KEY = "allStarPoints";
const ASG_CACHE_URL = "https://statsapi.mlb.com/api/v1.1/game/778566/feed/live";
const STATS_API_URL = "https://statsapi.mlb.com/api";

function getOwnerByTeamId(teamId, mlbStandings) {
  if (!mlbStandings) return null;
  for (const leagueKey in mlbStandings) {
    const league = mlbStandings[leagueKey];
    for (const divisionKey in league) {
      const division = league[divisionKey];
      for (const standing of Object.values(division.standings)) {
        if (standing.team.id === teamId) {
          return standing.team.owner || null;
        }
      }
    }
  }
  return null;
}

export async function getAllStarBreakData() {
  // Try to get cached MLB standings first (with 1 hour expiration)
  let mlbStandings = null;
  const cachedStandingsRaw = localStorage.getItem(MLB_STANDINGS_KEY);
  let cacheValid = false;
  if (cachedStandingsRaw) {
    try {
      const cachedObj = JSON.parse(cachedStandingsRaw);
      const now = Date.now();
      if (
        cachedObj.timestamp &&
        now - cachedObj.timestamp < MLB_STANDINGS_EXPIRATION
      ) {
        mlbStandings = cachedObj.data;
        cacheValid = true;
      }
    } catch (e) {
      // ignore parse errors, treat as no cache
    }
  }
  if (!cacheValid) {
    mlbStandings = await getMlbStandings();
    localStorage.setItem(
      MLB_STANDINGS_KEY,
      JSON.stringify({ data: mlbStandings, timestamp: Date.now() })
    );
  }

  // Try to get cached ASG data first
  const cachedRoster = localStorage.getItem(ASG_ROSTER_KEY);
  const cachedPoints = localStorage.getItem(ASG_POINTS_KEY);
  if (cachedRoster && cachedPoints) {
    return {
      mlbStandings,
      allStarPlayers: JSON.parse(cachedRoster),
      ownerPoints: JSON.parse(cachedPoints),
    };
  }

  // Fetch ASG roster
  const asgRes = await axios.get(ASG_CACHE_URL);
  const players = Object.values(asgRes.data.gameData.players);

  // Enrich roster and calculate points
  const pointsPerPlayer = 6;
  const pointsByOwner = {};
  const enrichedRoster = [];

  for (const player of players) {
    try {
      // Fetch player team info
      const res = await axios.get(
        `${STATS_API_URL}/v1/people/${player.id}?hydrate=currentTeam`
      );
      if (!res.data.people[0].currentTeam) continue;
      player.teamName = res.data.people[0].currentTeam.name;
      // Fetch league info
      const teamRes = await axios.get(
        `${STATS_API_URL}/v1/teams/${res.data.people[0].currentTeam.id}`
      );
      player.asgTeamName = teamRes?.data?.teams[0].league.name;
      player.owner = getOwnerByTeamId(
        res.data.people[0].currentTeam.id,
        mlbStandings
      );
      // Add points to owner
      if (player.owner) {
        pointsByOwner[player.owner] =
          (pointsByOwner[player.owner] || 0) + pointsPerPlayer;
      }
      enrichedRoster.push(player);
    } catch (e) {
      // Log and skip player on error
      console.warn(`Error enriching All-Star player ${player.id}:`, e);
    }
  }

  // Cache enriched roster and points (no expiration)
  localStorage.setItem(ASG_ROSTER_KEY, JSON.stringify(enrichedRoster));
  localStorage.setItem(ASG_POINTS_KEY, JSON.stringify(pointsByOwner));

  return {
    mlbStandings,
    allStarPlayers: enrichedRoster,
    ownerPoints: pointsByOwner,
  };
}
