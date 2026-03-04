<script setup>
// dependencies
import { ref, watch, onMounted } from "vue";
import { useMlbStandings } from "@/composables/useMlbStandings.js";
import { getAllStarBreakData } from "@/scripts/allstar-break-logic.js";

const { mlbStandings } = useMlbStandings();
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

function calculatePoints() {
  Object.keys(points.value).forEach((owner) => {
    points.value[owner] =
      (mlbPoints.value[owner] || 0) + (allStarPoints.value[owner] || 0);
  });
}

watch(mlbStandings, (standings) => {
  if (!standings) return;
  mlbPoints.value = {
    Cameron: 0,
    Caden: 0,
    Jack: 0,
    Dad: 0,
  };
  Object.values(standings).forEach((league) => {
    Object.values(league).forEach((division) => {
      const team = division.leader.team;
      if (mlbPoints.value[team.owner] !== undefined) {
        mlbPoints.value[team.owner] += team.odds;
      }
    });
  });
  calculatePoints();
}, { immediate: true });

onMounted(async () => {
  const allStar = await getAllStarBreakData();
  if (allStar && allStar.ownerPoints) {
    Object.entries(allStar.ownerPoints).forEach(([owner, asgPoints]) => {
      if (allStarPoints.value[owner] !== undefined) {
        allStarPoints.value[owner] = asgPoints;
      }
    });
  }
  calculatePoints();
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
            <span class="value-details">
              ({{ mlbPoints[person[0]] }}/{{
                allStarPoints[person[0]] || 0
              }})</span
            >
          </td>
        </tr>
      </tbody>
    </table>
    <div class="helper-text">
      <strong>Key:</strong> Total Points (<span class="value-details"
        >MLB/All-Star</span
      >)
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
  background: var(--color-table-row-alt);
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
.value-details {
  color: var(--color-muted);
  font-size: 0.95em;
}
.helper-text {
  margin-top: 8px;
  font-size: 0.95em;
  color: var(--color-text-secondary);
}
</style>
