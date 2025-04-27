const LOGO_API_PREFIX =
  "https://www.mlbstatic.com/team-logos/team-cap-on-light/";

function getTeamLogoURL(teamId) {
  return `${LOGO_API_PREFIX}${teamId}.svg`;
}

export default getTeamLogoURL;
