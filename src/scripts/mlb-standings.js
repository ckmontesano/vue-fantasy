import mlbData from "@/data/mlb-2025.json";

export default async function getMlbStandings() {
  return mlbData.standings;
}
