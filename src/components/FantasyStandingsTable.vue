<script setup>
// dependencies
import { ref, onMounted } from "vue";
import getMlbStandings from "@/scripts/mlb-standings.js";
import { getAllStarBreakData } from "@/scripts/allstar-break-logic.js";

const mlbStandings = ref(null);
const points = ref({
  Cameron: 0,
  Caden: 0,
  Jack: 0,
  Dad: 0,
});
const mlbPoints = ref({
  Cameron: 0,
  Caden: 0,
  Jack: 0,
  Dad: 0,
});
const allStarPoints = ref({
  Cameron: 0,
  Caden: 0,
  Jack: 0,
  Dad: 0,
});

onMounted(async () => {
  // Get MLB standings and All-Star points
  const [mlb, allStar] = await Promise.all([
    getMlbStandings(),
    getAllStarBreakData(),
  ]);
  mlbStandings.value = mlb;

  // Calculate points from MLB standings
  Object.values(mlbStandings.value).forEach((league) => {
    Object.values(league).forEach((division) => {
      const team = division.leader.team;
      switch (team.owner) {
        case "Cameron":
          mlbPoints.value.Cameron += team.odds;
          break;
        case "Caden":
          mlbPoints.value.Caden += team.odds;
          break;
        case "Jack":
          mlbPoints.value.Jack += team.odds;
          break;
        case "Dad":
          mlbPoints.value.Dad += team.odds;
          break;
        default:
          break;
      }
    });
  });

  // Add All-Star points
  if (allStar && allStar.ownerPoints) {
    Object.entries(allStar.ownerPoints).forEach(([owner, asgPoints]) => {
      if (allStarPoints.value[owner] !== undefined) {
        allStarPoints.value[owner] = asgPoints;
      }
    });
  }

  // Combine for total points
  Object.keys(points.value).forEach((owner) => {
    points.value[owner] =
      mlbPoints.value[owner] + (allStarPoints.value[owner] || 0);
  });

  console.log(points, mlbPoints, allStarPoints);
});
</script>

<template>
  <template v-if="mlbStandings">
    <table>
      <thead>
        <tr>
          <th>Team</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(person, personKey) in Object.entries(points).sort(
            (a, b) => b[1] - a[1]
          )"
          :key="personKey">
          <td>
            <img src="@/assets/crown.png" />
            {{ person[0] }}
          </td>
          <td>
            {{ person[1] }}
            <span style="color: #888; font-size: 0.95em">
              ({{ mlbPoints[person[0]] }}/{{
                allStarPoints[person[0]] || 0
              }})</span
            >
          </td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top: 8px; font-size: 0.95em; color: #555">
      <strong>Key:</strong> (<span style="color: #888">MLB/All-Star</span>) —
      MLB = points from division leaders, All-Star = points from All-Star
      selections
    </div>
    <a href="#/teams">See team ownerships →</a>
  </template>
  <p v-else>Loading…</p>
</template>

<style scoped>
a {
  display: block;
  margin-top: 10px;
}
tbody tr:first-child {
  font-weight: bold;
}
tbody tr:not(:first-child) {
  background: #e6e6e6;
}
/* crown icon */
tbody tr td img {
  height: 1.2em;
  vertical-align: middle;
  margin-top: -2px;
}
tbody tr:not(:first-child) td:first-child img {
  display: none;
}
</style>
