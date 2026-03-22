<script setup>
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

watch(
  mlbStandings,
  (standings) => {
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
  },
  { immediate: true },
);

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
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse text-sm">
        <thead>
          <tr class="bg-zinc-300 dark:bg-zinc-700">
            <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Team</th>
            <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(person, personKey) in Object.entries(points).sort((a, b) => b[1] - a[1])"
            :key="personKey"
            :class="personKey === 0 ? 'font-bold' : 'bg-zinc-100 dark:bg-zinc-800/70'">
            <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">
              <img
                class="-mt-0.5 mr-1 inline h-5 align-middle"
                :class="personKey === 0 ? '' : 'hidden'"
                src="@/assets/crown.png"
                alt="" />
              {{ person[0] }}
            </td>
            <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">
              {{ person[1] }}
              <span class="text-sm text-zinc-500 dark:text-zinc-400">
                ({{ mlbPoints[person[0]] }}/{{ allStarPoints[person[0]] || 0 }})
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
      <strong>Key:</strong> Total Points (<span class="text-zinc-500 dark:text-zinc-400">MLB/All-Star</span>)
    </div>
    <a class="mt-2 block" href="#/teams">See team ownerships →</a>
  </template>
  <p v-else>Loading…</p>
</template>
