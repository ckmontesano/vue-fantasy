import mlbData from "@/data/mlb-2025.json";

export async function getAllStarBreakData() {
  return {
    mlbStandings: mlbData.standings,
    allStarPlayers: mlbData.allStarPlayers,
    ownerPoints: mlbData.ownerPoints,
  };
}
