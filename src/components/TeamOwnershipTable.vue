<script setup>
const { teams } = defineProps(['teams'])
import getTeamLogoURL from '@/scripts/mlb-team-logos.js'
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Team</th>
        <th>Place in Division</th>
        <th>Games Back</th>
        <th>Points</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(team, index) in teams.slice().sort((a, b) => a.divisionRank - b.divisionRank)"
        :key="index"
        v-bind:class="{ firstPlace: team.divisionRank === 1 }"
      >
        <td class="no-wrap">
          <img class="team-logo" :src="getTeamLogoURL(team.team.id)" />
          {{ team.team.name }}
        </td>
        <td>{{ team.divisionRank }}</td>
        <td>{{ team.gamesBack }}</td>
        <td>{{ team.team.odds }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.firstPlace {
  font-weight: bold;
}
</style>