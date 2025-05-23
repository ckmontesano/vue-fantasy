import axios from "axios";
import attachDivisionOdds from "@/scripts/mlb-division-odds";
import attachTeamOwners from "@/scripts/fantasy-team-owners";

// Constants for localStorage
const STORAGE_KEY = "mlb_standings_cache";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// helper that returns correct statsapi endpoint for a given league, season and optional date
function buildStandingsUrl({ leagueId, season, date }) {
  let url = `https://statsapi.mlb.com/api/v1/standings?leagueId=${leagueId}&season=${season}`;

  // The MLB Stats API accepts a `date` query param in the format YYYY-MM-DD to
  // return the standings as of that date.
  if (date) {
    url += `&date=${date}`;
  }

  return url;
}

function attachDivisionLeaders(mlbStandings) {
  if (!mlbStandings) return;

  for (const league of Object.values(mlbStandings)) {
    for (const division of Object.values(league)) {
      division.leader = division.standings.find(
        (team) => team.divisionLeader === true
      );
    }
  }

  return mlbStandings;
}

/**
 * Get cached standings if they exist and are not expired
 * @returns {object|null} The cached standings object or null if not found/expired
 */
function getCachedStandings() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (!cached) {
    console.log("No cached standings found");
    return null;
  }

  try {
    const { data, timestamp } = JSON.parse(cached);
    const now = new Date().getTime();
    const age = now - timestamp;

    // Check if cache is still valid (less than 1 hour old)
    if (age < CACHE_DURATION) {
      console.log(
        `Using cached standings (${Math.round(age / 1000 / 60)} minutes old)`
      );
      return data;
    } else {
      console.log(`Cache expired (${Math.round(age / 1000 / 60)} minutes old)`);
    }
  } catch (e) {
    console.warn("Error reading cached standings:", e);
  }

  return null;
}

/**
 * Store standings in localStorage with current timestamp
 * @param {object} standings The standings data to cache
 */
function cacheStandings(standings) {
  try {
    const cacheData = {
      data: standings,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    console.log("Cached new standings data");
  } catch (e) {
    console.warn("Error caching standings:", e);
  }
}

/**
 * Retrieve MLB standings.
 * Will use cached data if available and less than 24 hours old.
 * Otherwise, fetches fresh data from the MLB API.
 *
 * @param {string|null} dateString - Optional date (YYYY-MM-DD). When provided,
 *   the standings returned are those **as of that date**. When omitted, the
 *   current standings are returned.
 * @returns {Promise<object>} The enriched MLB standings object broken down by
 *   league and division.
 */
async function getMlbStandings(dateString = null) {
  // If requesting historical data (with dateString), don't use cache
  if (dateString) {
    console.log("Fetching historical standings (bypassing cache)");
    return await fetchFreshStandings(dateString);
  }

  // Try to get cached standings first
  const cachedStandings = getCachedStandings();
  if (cachedStandings) {
    return cachedStandings;
  }

  // If no cache or expired, fetch fresh data
  console.log("Fetching fresh standings from API");
  const freshStandings = await fetchFreshStandings(dateString);
  cacheStandings(freshStandings);
  return freshStandings;
}

/**
 * Fetch fresh standings data from the MLB API
 * @param {string|null} dateString Optional date string
 * @returns {Promise<object>} Fresh standings data
 */
async function fetchFreshStandings(dateString = null) {
  var mlbStandings = {
    american: {
      east: { name: "American League East", standings: [] },
      central: { name: "American League Central", standings: [] },
      west: { name: "American League West", standings: [] },
    },
    national: {
      east: { name: "National League East", standings: [] },
      central: { name: "National League Central", standings: [] },
      west: { name: "National League West", standings: [] },
    },
  };

  // Stats API still requires a season param.  Use the season that corresponds
  // to the provided date (or today when no date is supplied).
  const seasonYear = dateString
    ? new Date(dateString).getFullYear()
    : new Date().getFullYear();

  const alUrl = buildStandingsUrl({
    leagueId: 103,
    season: seasonYear,
    date: dateString,
  });
  const nlUrl = buildStandingsUrl({
    leagueId: 104,
    season: seasonYear,
    date: dateString,
  });

  // Fetch AL / NL standings concurrently for slight speed-up
  const [alRes, nlRes] = await Promise.all([
    axios.get(alUrl),
    axios.get(nlUrl),
  ]);

  mlbStandings.american.east.standings = alRes.data.records[0].teamRecords;
  mlbStandings.american.central.standings = alRes.data.records[1].teamRecords;
  mlbStandings.american.west.standings = alRes.data.records[2].teamRecords;

  mlbStandings.national.east.standings = nlRes.data.records[0].teamRecords;
  mlbStandings.national.central.standings = nlRes.data.records[1].teamRecords;
  mlbStandings.national.west.standings = nlRes.data.records[2].teamRecords;

  // add extras for app
  mlbStandings = attachDivisionOdds(mlbStandings);
  mlbStandings = attachDivisionLeaders(mlbStandings);
  mlbStandings = attachTeamOwners(mlbStandings);

  return mlbStandings;
}

export default getMlbStandings;
