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
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.american.east" />
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.american.central" />
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.american.west" />
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.national.east" />
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.national.central" />
  <MLBStandingsTable v-if="mlbStandings" :division="mlbStandings.national.west" />
</template>
