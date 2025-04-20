<script setup>
  const { division } = defineProps(['division'])
</script>

<template>
  <p v-if="!division"><b>MlbStandingsTable:</b> No division was provided.</p>
  <div v-if="division">
    <h2>{{division.name}}</h2>
    <table>
      <thead>
        <tr>
          <th>Team</th>
          <th>OTWD</th>
          <th>Owner</th>
          <th>Wins</th>
          <th>Losses</th>
          <th>PCT</th>
          <th>GB</th>
          <th>Home</th>
          <th>Away</th>
          <th>L10</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="team in division.standings" :key="team.id">
          <td class='no-wrap'><img class="team-logo" :src="team.logo" />{{team.team.name}}</td>
          <td>-</td>
          <td>-</td>
          <td>{{team.wins}}</td>
          <td>{{team.losses}}</td>
          <td>{{team.winningPercentage}}</td>
          <td>{{team.gamesBack}}</td>
          <td class='no-wrap'>{{team.records.splitRecords[0].wins}}-{{team.records.splitRecords[0].losses}}</td>
          <td class='no-wrap'>{{team.records.splitRecords[1].wins}}-{{team.records.splitRecords[1].losses}}</td>
          <td class='no-wrap'>{{team.records.splitRecords[8].wins}}-{{team.records.splitRecords[8].losses}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
