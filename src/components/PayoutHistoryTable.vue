<script setup>
// dependencies
import { ref, onMounted } from "vue";
import getMlbStandings from "@/scripts/mlb-standings.js";

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
      const formattedDate = formatDate(date);
      payoutHistory.value.push({
        date: formattedDate,
        winner: winner,
        amount: "$60",
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

function formatDate(date) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[date.getMonth()];
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Winner</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(entry, index) in payoutHistory" :key="index">
        <td>{{ entry.date }}</td>
        <td>{{ entry.winner }}</td>
        <td>{{ entry.amount }}</td>
      </tr>
    </tbody>
  </table>
</template>
