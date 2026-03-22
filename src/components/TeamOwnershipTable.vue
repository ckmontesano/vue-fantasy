<script setup>
import getTeamLogoURL from "@/scripts/mlb-team-logos.js";

const { teams } = defineProps(["teams"]);
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full border-collapse text-sm">
    <thead>
      <tr class="bg-zinc-300 dark:bg-zinc-700">
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Team</th>
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Place in Division</th>
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Games Back</th>
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Points</th>
      </tr>
    </thead>
    <tbody>
      <tr
        class="odd:bg-zinc-100 odd:dark:bg-zinc-800/70"
        v-for="(team, index) in teams.slice().sort((a, b) => a.divisionRank - b.divisionRank)"
        :key="index">
        <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">
          <img class="mr-1 inline h-5 w-5 align-middle" :src="getTeamLogoURL(team.team.id)" />
          {{ team.team.name }}
        </td>
        <td class="border border-zinc-500/50 px-3 py-2">{{ team.divisionRank }}</td>
        <td class="border border-zinc-500/50 px-3 py-2">{{ team.gamesBack }}</td>
        <td class="border border-zinc-500/50 px-3 py-2">{{ team.team.odds }}</td>
      </tr>
    </tbody>
  </table>
  </div>
</template>
