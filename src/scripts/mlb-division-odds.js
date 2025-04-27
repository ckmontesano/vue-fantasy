import originalDivisionOdds from "@/scripts/utils/original-division-odds.json";

// todo: this
function getCurrentOdds() {}

function attachDivisionOdds(mlbStandings) {
  if (!mlbStandings) return;

  // Create a Map for quick lookup of odds by team_id
  const oddsMap = new Map(
    originalDivisionOdds.teams.map((team) => [team.team_id, team.odds])
  );

  for (const league of Object.values(mlbStandings)) {
    for (const division of Object.values(league)) {
      division.standings.forEach((standing) => {
        const teamId = standing.team.id;
        standing.team.odds = oddsMap.get(teamId) ?? null; // Add odds or null if not found
      });
    }
  }

  return mlbStandings;
}

export default attachDivisionOdds;
