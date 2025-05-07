<script setup>
// dependencies
import { ref, onMounted } from "vue";
import getMlbStandings from "@/scripts/mlb-standings.js";

const mlbStandings = ref(null);
const points = ref({
    Cameron: 0,
    Caden: 0,
    Jack: 0,
    Dad: 0,
  });

onMounted(async () => {
  mlbStandings.value = await getMlbStandings();

  Object.values(mlbStandings.value).forEach((league) => {
    Object.values(league).forEach((division) => {
      const team = division.leader.team;
      switch (team.owner) {
        case "Cameron":
          points.value.Cameron += team.odds;
          break;
        case "Caden":
          points.value.Caden += team.odds;
          break;
        case "Jack":
          points.value.Jack += team.odds;
          break;
        case "Dad":
          points.value.Dad += team.odds;
          break;
        default:
          break;
      }
    });
  });

  console.log(points);
});
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Team</th>
        <th>Points</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(person, personKey) in Object.entries(points).sort((a, b) => b[1] - a[1])" :key="personKey">
        <td>
          <img src="@/assets/crown.png" />
          {{ person[0] }}</td>
        <td>{{ person[1] }}</td>
      </tr>
    </tbody>
  </table>
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
tbody tr:not(:first-child) td:first-child img{
  display: none;
}
</style>