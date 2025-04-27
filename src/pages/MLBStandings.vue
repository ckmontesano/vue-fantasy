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
  <h1>MLB Standings</h1>
    <div>
      <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.american.east" />
      <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.american.central" />
      <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.american.west" />
    </div>
    <div>
      <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.national.east" />
      <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.national.central" />
      <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.national.west" />
    </div>
    <ul class='legend'>
      <li><b>COTWD =</b> Current Odds to Win Division</li>
      <li><b>OOTWD =</b> Original Odds to Win Division</li>
      <li><b>PCT =</b> Win Percentage</li>
      <li><b>GB = </b> Games Back</li>
      <li><b>L10 =</b> Record for Last 10 Games</li>
    </ul>
</template>

<style scoped>
  .legend {
    margin: 48px 0 0;
    padding: 0;
    list-style: none;
    text-align: left;
  }
</style>