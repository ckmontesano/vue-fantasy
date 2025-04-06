<script setup>
  // dependencies
  import { ref, onMounted } from "vue"
  import getMlbStandings from "@/scripts/mlb-standings.js";
  // components
  import MLBStandingsTable from "@/components/MlbStandingsTable.vue";
  
  const mlbStandings = ref(null);
  onMounted(async() => {
    mlbStandings.value = await getMlbStandings();
  })
</script>

<template>
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.american.east" />
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.american.central" />
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.american.west" />
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.national.east" />
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.national.central" />
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.national.west" />
</template>
<!--
<template>
  <h1>MLB Standings</h1>

  <MLBStandingsTable />
  
  <h2>AL East</h2>
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
      <tr v-for="team in alEastTeams" :key="team.id">
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

  <h2>AL Central</h2>
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
      <tr v-for="team in alCentralTeams" :key="team.id">
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

  <h2>AL West</h2>
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
      <tr v-for="team in alWestTeams" :key="team.id">
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

    
  <h2>NL East</h2>
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
      <tr v-for="team in nlEastTeams" :key="team.id">
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

  <h2>NL Central</h2>
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
      <tr v-for="team in nlCentralTeams" :key="team.id">
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

  <h2>NL West</h2>
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
      <tr v-for="team in nlWestTeams" :key="team.id">
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
</template>-->
