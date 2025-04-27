<script setup>
  // dependencies
  import { ref, onMounted } from "vue"
  import getMlbStandings from "@/scripts/mlb-standings.js"
  import getTeamLogoURL from '@/scripts/mlb-team-logos.js'
  
  const mlbStandings = ref(null);
  onMounted(async() => {
    mlbStandings.value = await getMlbStandings();
    console.log("mlbStandings", mlbStandings.value)
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
      <tr>
        <td>American East</td>
        <td class='no-wrap'><img class="team-logo" :src="getTeamLogoURL(mlbStandings.american.east.leader.team.id)" />{{mlbStandings.american.east.leader.team.name}}</td>
        <td></td>
        <td>+{{mlbStandings.american.east.leader.team.odds}}</td>
      </tr>
      <tr>
        <td>American Central</td>
        <td class='no-wrap'><img class="team-logo" :src="getTeamLogoURL(mlbStandings.american.central.leader.team.id)" />{{mlbStandings.american.central.leader.team.name}}</td>
        <td></td>
        <td>+{{mlbStandings.american.central.leader.team.odds}}</td>
      </tr>
      <tr>
        <td>American West</td>
        <td class='no-wrap'><img class="team-logo" :src="getTeamLogoURL(mlbStandings.american.west.leader.team.id)" />{{mlbStandings.american.west.leader.team.name}}</td>
        <td></td>
        <td>+{{mlbStandings.american.west.leader.team.odds}}</td>
      </tr>
      <tr>
        <td>National East</td>
        <td class='no-wrap'><img class="team-logo" :src="getTeamLogoURL(mlbStandings.national.east.leader.team.id)" />{{mlbStandings.national.east.leader.team.name}}</td>
        <td></td>
        <td>+{{mlbStandings.national.east.leader.team.odds}}</td>
      </tr>
      <tr>
        <td>National Central</td>
        <td class='no-wrap'><img class="team-logo" :src="getTeamLogoURL(mlbStandings.national.central.leader.team.id)" />{{mlbStandings.national.central.leader.team.name}}</td>
        <td></td>
        <td>+{{mlbStandings.national.central.leader.team.odds}}</td>
      </tr>
      <tr>
        <td>National West</td>
        <td class='no-wrap'><img class="team-logo" :src="getTeamLogoURL(mlbStandings.national.west.leader.team.id)" />{{mlbStandings.national.west.leader.team.name}}</td>
        <td></td>
        <td>+{{mlbStandings.national.west.leader.team.odds}}</td>
      </tr>
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