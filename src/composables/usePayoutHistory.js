import { ref, onMounted } from "vue";
import getMlbStandings from "@/scripts/mlb-standings.js";

export function usePayoutHistory() {
  const payoutHistory = ref([]);

  onMounted(async () => {
    const months = ["05", "06", "07", "08", "09", "10"];
    const year = 2025;
    const currentDate = new Date();

    for (const month of months) {
      const dateString = `${year}-${month}-01`;
      const date = new Date(dateString);
      if (date <= currentDate) {
        const standings = await getMlbStandings(dateString);
        const winner = determineWinner(standings);
        const losers = determineLosers(standings, winner);
        const formattedDate = formatDate(date);
        payoutHistory.value.push({
          date: formattedDate,
          winner,
          losers,
          amount: 60,
        });
      }
    }
  });

  function determineWinner(standings) {
    let maxPoints = 0;
    let winner = null;
    Object.values(standings).forEach((league) => {
      Object.values(league).forEach((division) => {
        const team = division.leader.team;
        if (team.odds > maxPoints) {
          maxPoints = team.odds;
          winner = team.owner;
        }
      });
    });
    return winner;
  }

  // Static list of all participants
  const participants = ["Jack", "Caden", "Cameron", "Dad"];

  function determineLosers(standings, winner) {
    // Always use the static list, exclude the winner
    const losers = participants.filter((p) => p !== winner);
    console.log("All participants for this month:", participants);
    // Always return exactly 3 losers
    return losers.slice(0, 3);
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  }

  return { payoutHistory };
}
