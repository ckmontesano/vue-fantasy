<script setup>
import getTeamLogoURL from "@/scripts/mlb-team-logos.js";

const { division } = defineProps(["division"]);
</script>

<template>
  <p v-if="!division"><b>MlbStandingsTable:</b> No division was provided.</p>
  <div v-if="division">
    <h2 class="mb-2 text-xl font-semibold">{{ division.name }}</h2>
    <div class="mb-7 overflow-x-auto">
      <table class="min-w-full border-collapse text-sm">
      <thead>
        <tr class="bg-zinc-300 dark:bg-zinc-700">
          <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Team</th>
          <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Owner</th>
          <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">GB</th>
          <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">OOTWD</th>
          <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">W</th>
          <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">L</th>
          <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">PCT</th>
          <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Home</th>
          <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Away</th>
          <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">L10</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="team in division.standings" :key="team.id" class="odd:bg-zinc-100 odd:dark:bg-zinc-800/70">
          <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2"><img class="mr-1 inline h-5 w-5 align-middle" :src="getTeamLogoURL(team.team.id)" />{{ team.team.name }}</td>
          <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ team.team.owner }}</td>
          <td class="border border-zinc-500/50 px-3 py-2">{{ team.gamesBack }}</td>
          <td class="border border-zinc-500/50 px-3 py-2">+{{ team.team.odds }}</td>
          <td class="border border-zinc-500/50 px-3 py-2">{{ team.wins }}</td>
          <td class="border border-zinc-500/50 px-3 py-2">{{ team.losses }}</td>
          <td class="border border-zinc-500/50 px-3 py-2">{{ team.winningPercentage }}</td>
          <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ team.records.splitRecords[0].wins }}-{{ team.records.splitRecords[0].losses }}</td>
          <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ team.records.splitRecords[1].wins }}-{{ team.records.splitRecords[1].losses }}</td>
          <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ team.records.splitRecords[8].wins }}-{{ team.records.splitRecords[8].losses }}</td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>
