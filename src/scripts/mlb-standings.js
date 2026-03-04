import mlbData from "@/data/mlb-2025.json";

async function getMlbStandings() {
  return mlbData.standings;
}

export default getMlbStandings;
