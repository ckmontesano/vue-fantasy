// todo: to be deprecated with introduction of API

import axios from "axios";
import addAllTeamLogos from "./mlb-team-logos";

const AL_API = "https://statsapi.mlb.com/api/v1/standings?leagueId=103";
const NL_API = "https://statsapi.mlb.com/api/v1/standings?leagueId=104";

async function getMlbStandings() {
  var mlbStandings = {
    american: {
      east: { name: "AL East", standings: [] },
      central: { name: "AL Central", standings: [] },
      west: { name: "AL West", standings: [] },
    },
    national: {
      east: { name: "NL East", standings: [] },
      central: { name: "NL Central", standings: [] },
      west: { name: "NL West", standings: [] },
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

  mlbStandings = await addAllTeamLogos(mlbStandings);

  return mlbStandings;
}

export default getMlbStandings;
