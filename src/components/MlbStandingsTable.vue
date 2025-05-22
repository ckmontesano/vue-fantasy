<script setup>
  const { division } = defineProps(['division'])
  import getTeamLogoURL from '@/scripts/mlb-team-logos.js'
</script>

<template>
  <p v-if="!division"><b>MlbStandingsTable:</b> No division was provided.</p>
  <div v-if="division">
    <h2>{{division.name}}</h2>
    <table>
      <thead>
        <tr>
          <th>Team</th>
          <th>Owner</th>
          <th>GB</th>
          <th>OOTWD</th>
          <th>W</th>
          <th>L</th>
          <th>PCT</th>
          <th>Home</th>
          <th>Away</th>
          <th>L10</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="team in division.standings" :key="team.id">
          <td class='no-wrap'><img class="team-logo" :src="getTeamLogoURL(team.team.id)" />{{team.team.name}}</td>
          <td>{{ team.team.owner }}</td>
          <td>{{team.gamesBack}}</td>
          <td>+{{ team.team.odds }}</td>
          <td>{{team.wins}}</td>
          <td>{{team.losses}}</td>
          <td>{{team.winningPercentage}}</td>
          <td class='no-wrap'>{{team.records.splitRecords[0].wins}}-{{team.records.splitRecords[0].losses}}</td>
          <td class='no-wrap'>{{team.records.splitRecords[1].wins}}-{{team.records.splitRecords[1].losses}}</td>
          <td class='no-wrap'>{{team.records.splitRecords[8].wins}}-{{team.records.splitRecords[8].losses}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
  table {
    margin-bottom: 28px;
  }
</style>