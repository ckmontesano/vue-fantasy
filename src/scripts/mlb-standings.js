import axios from "axios";
import attachDivisionOdds from "@/scripts/mlb-division-odds";
import attachTeamOwners from "@/scripts/fantasy-team-owners";

const AL_API =
  "https://statsapi.mlb.com/api/v1/standings?leagueId=103&season=2025";
const NL_API =
  "https://statsapi.mlb.com/api/v1/standings?leagueId=104&season=2025";

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

async function getMlbStandings() {
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

  const alRes = await axios.get(AL_API);
  const nlRes = await axios.get(NL_API);

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
