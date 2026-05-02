<script setup>
  // dependencies
  import { ref } from "vue"
  import { useMlbStandings } from "@/composables/useMlbStandings.js";

  // components
  import MLBStandingsTable from "@/components/MlbStandingsTable.vue";
  import TabsComponent from '@/components/TabsComponent.vue';
  
  const { mlbStandings } = useMlbStandings();
  const activeTab = ref('american');
  const tabs = [
    { id: 'american', label: 'American League' },
    { id: 'national', label: 'National League' }
  ];

</script>

<template>
  <h1 class="my-2 text-4xl font-semibold tracking-tight">MLB Standings</h1>
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

  <ul class="mt-12 list-none p-0 text-left">
    <li><b>Odds =</b> Draft-day division odds</li>
    <li><b>Pts =</b> 2026 prorated fantasy points</li>
    <li><b>W =</b> Wins</li>
    <li><b>L =</b> Losses</li>
    <li><b>PCT =</b> Win Percentage</li>
    <li><b>GB = </b> Games Back</li>
    <li><b>L10 =</b> Record for Last 10 Games</li>
  </ul>
</template>
