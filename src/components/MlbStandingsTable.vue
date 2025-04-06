<script setup>
  // styling
  import "@/styles/mlbStandingsTable.css";

  const { division } = defineProps(['division'])
</script>

<template>
  <p v-if="!division"><b>MlbStandingsTable:</b> No division was provided.</p>
  <div v-if="division">
    <h2>{{division.name}}</h2>
    <table class="mlb-standings-table">
      <thead>
        <tr>
          <td>Team</td>
          <td>OTWD</td>
          <td>Owner</td>
          <td>Wins</td>
          <td>Losses</td>
          <td>PCT</td>
          <td>GB</td>
          <td>Home</td>
          <td>Away</td>
          <td>L10</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="team in division.standings" :key="team.id">
          <td>{{team.team.name}}</td>
          <td>-</td>
          <td>-</td>
          <td>{{team.wins}}</td>
          <td>{{team.losses}}</td>
          <td>{{team.winningPercentage}}</td>
          <td>{{team.gamesBack}}</td>
          <td>{{team.records.splitRecords[0].wins}}-{{team.records.splitRecords[0].losses}}</td>
          <td>{{team.records.splitRecords[1].wins}}-{{team.records.splitRecords[1].losses}}</td>
          <td>{{team.records.splitRecords[8].wins}}-{{team.records.splitRecords[8].losses}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
