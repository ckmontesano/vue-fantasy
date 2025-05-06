<script setup>
  // dependencies
  import { ref, onMounted } from "vue"
  import getMlbStandings from "@/scripts/mlb-standings.js"
  import getTeamLogoURL from '@/scripts/mlb-team-logos.js'
  
  const mlbStandings = ref(null);
  onMounted(async() => {
    mlbStandings.value = await getMlbStandings();
  })
</script>

<template>
  <table v-if="mlbStandings">
  <thead>
    <tr>
      <th>Division</th>
      <th>Leader</th>
      <th>Owner</th>
      <th>Division Win Odds</th>
    </tr>
  </thead>
  <tbody>
    <template v-for="(league, leagueKey) in mlbStandings" :key="leagueKey">
      <template v-for="(division, divisionKey) in league" :key="divisionKey">
        <tr>
          <td>{{ division.name }}</td>
          <td class="no-wrap" v-if="division.leader">
            <img class="team-logo" :src="getTeamLogoURL(division.leader.team.id)" />
            {{ division.leader.team.name }}
          </td>
          <td v-else>—</td>
          <td v-if="division.leader">{{ division.leader.team.owner || 'Undrafted' }}</td>
          <td v-else>—</td>
          <td v-if="division.leader">+{{ division.leader.team.odds ?? 'N/A' }}</td>
          <td v-else>—</td>
        </tr>
      </template>
    </template>
  </tbody>
</table>
  <p v-if="!mlbStandings">Loading…</p>
  <a href='#/mlb-standings'>See full standings →</a>
</template>

<style scoped>
  a {
    display: block;
    margin-top: 10px;
  }
</style>