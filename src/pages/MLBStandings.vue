<script setup>
  // dependencies
  import { ref, onMounted } from "vue"
  import getMlbStandings from "@/scripts/mlb-standings.js";

  // components
  import MLBStandingsTable from "@/components/MlbStandingsTable.vue";
  import TabsComponent from '@/components/TabsComponent.vue';
  
  const mlbStandings = ref(null);
  const activeTab = ref('american');
  const tabs = [
    { id: 'american', label: 'American League' },
    { id: 'national', label: 'National League' }
  ];

  onMounted(async() => {
    mlbStandings.value = await getMlbStandings();
  })
</script>

<template>
  <h1>MLB Standings</h1>
  <TabsComponent
    v-model="activeTab"
    :tabs="tabs"
  />

  <div v-if="activeTab === 'american' && mlbStandings">
    <MLBStandingsTable :division="mlbStandings.american.east" />
    <MLBStandingsTable :division="mlbStandings.american.central" />
    <MLBStandingsTable :division="mlbStandings.american.west" />
  </div>

  <div v-if="activeTab === 'national' && mlbStandings">
    <MLBStandingsTable :division="mlbStandings.national.east" />
    <MLBStandingsTable :division="mlbStandings.national.central" />
    <MLBStandingsTable :division="mlbStandings.national.west" />
  </div>

  <ul class='legend'>
    <li><b>OOTWD =</b> Original Odds to Win Division</li>
    <li><b>W =</b> Wins</li>
    <li><b>L =</b> Losses</li>
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