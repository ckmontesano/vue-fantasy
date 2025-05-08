<script setup>
  // dependencies
  import { ref, onMounted } from "vue"
  import getMlbStandings from "@/scripts/mlb-standings.js";

  // components
  import MLBStandingsTable from "@/components/MlbStandingsTable.vue";
  
  const mlbStandings = ref(null);
  const activeTab = ref('american');

  onMounted(async() => {
    mlbStandings.value = await getMlbStandings();
  })
</script>

<template>
  <h1>MLB Standings</h1>
  <div class="tabs">
    <button 
      :class="{ active: activeTab === 'american' }" 
      @click="activeTab = 'american'"
    >
      American League
    </button>
    <button 
      :class="{ active: activeTab === 'national' }" 
      @click="activeTab = 'national'"
    >
      National League
    </button>
  </div>

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

  .tabs {
    margin: 16px 0;
    display: flex;
    gap: 8px;
  }

  .tabs button {
    padding: 6px 12px;
    border: 1px solid #000;
    background: #e0e0e0;
    color: #000;
    cursor: pointer;
    border-radius: 2px;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .tabs button.active {
    background: #000;
    color: #fff;
  }

  .tabs button:hover:not(.active) {
    background: #d0d0d0;
  }
</style>