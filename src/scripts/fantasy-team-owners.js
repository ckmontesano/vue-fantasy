import fantasyTeamOwners from "@/scripts/utils/original-team-owners.json";

function attachTeamOwners(mlbStandings) {
  if (!mlbStandings) return;

  // Create a Map for quick lookup of owner by team_id
  const ownersMap = new Map(
    fantasyTeamOwners.teams.map((team) => [team.team_id, team.owner])
  );

  for (const league of Object.values(mlbStandings)) {
    for (const division of Object.values(league)) {
      division.standings.forEach((standing) => {
        const teamId = standing.team.id;
        standing.team.owner = ownersMap.get(teamId) ?? "Unknown";
      });
    }
  }

  return mlbStandings;
}

export default attachTeamOwners;
