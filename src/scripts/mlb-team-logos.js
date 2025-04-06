const LOGO_API_PREFIX =
  "https://www.mlbstatic.com/team-logos/team-cap-on-light/";

function getTeamLogo(teamId) {
  return `${LOGO_API_PREFIX}${teamId}.svg`;
}

function addAllTeamLogos(mlbStandings) {
  if (!mlbStandings) return null;

  for (const leagueKey in mlbStandings) {
    const league = mlbStandings[leagueKey];

    for (const divisionKey in league) {
      const division = league[divisionKey];

      for (const team of division.standings) {
        const teamId = team.team.id;
        team.logo = getTeamLogo(teamId);
      }
    }
  }

  return mlbStandings;
}

export default addAllTeamLogos;
