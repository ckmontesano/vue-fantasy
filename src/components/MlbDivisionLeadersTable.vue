<script setup>
  // dependencies
  import { useMlbStandings } from "@/composables/useMlbStandings.js";
  import getTeamLogoURL from '@/scripts/mlb-team-logos.js'

  const { mlbStandings } = useMlbStandings();
</script>

<template>
  <div v-if="mlbStandings" class="overflow-x-auto">
    <table class="min-w-full border-collapse text-sm">
    <thead>
      <tr class="bg-zinc-300 dark:bg-zinc-700">
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Division</th>
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Leader</th>
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Owner</th>
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Division Win Odds</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(league, leagueKey) in mlbStandings" :key="leagueKey">
        <template v-for="(division, divisionKey) in league" :key="divisionKey">
          <tr>
            <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ division.name.replace('American League', 'AL').replace('National League', 'NL') }}</td>
            <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2" v-if="division.leader">
              <img class="mr-1 inline h-5 w-5 align-middle" :src="getTeamLogoURL(division.leader.team.id)" />
              {{ division.leader.team.name }}
            </td>
            <td class="border border-zinc-500/50 px-3 py-2" v-else>—</td>
            <td class="border border-zinc-500/50 px-3 py-2" v-if="division.leader">{{ division.leader.team.owner || 'Undrafted' }}</td>
            <td class="border border-zinc-500/50 px-3 py-2" v-else>—</td>
            <td class="border border-zinc-500/50 px-3 py-2" v-if="division.leader">+{{ division.leader.team.odds ?? 'N/A' }}</td>
            <td class="border border-zinc-500/50 px-3 py-2" v-else>—</td>
          </tr>
        </template>
      </template>
    </tbody>
    </table>
  </div>
  <p v-if="!mlbStandings">Loading…</p>
  <a class="mt-2 block" href="#/mlb-standings">See full standings →</a>
</template>
