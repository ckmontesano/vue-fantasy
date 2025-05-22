<script setup>
  // components
  import MlbDivisionLeadersTable from '@/components/MlbDivisionLeadersTable.vue';
  import FantasyStandingsTable from '@/components/FantasyStandingsTable.vue';
  import PayoutHistoryTable from '@/components/PayoutHistoryTable.vue';
  import TabsComponent from '@/components/TabsComponent.vue';
  import { ref } from 'vue';

  const activeTab = ref('standings');
  const tabs = [
    { id: 'standings', label: 'Standings' },
    { id: 'payouts', label: 'Payouts' }
  ];
</script>

<template>
  <h1>Home</h1>
  <TabsComponent
    v-model="activeTab"
    :tabs="tabs"
  />

  <div v-if="activeTab === 'standings'" class="sections-container">
    <div class="section">
      <h2>Fantasy Standings</h2>
      <FantasyStandingsTable />
    </div>
    <div class="section mlb-section">
      <h2>MLB Division Leaders</h2>
      <MlbDivisionLeadersTable />
    </div>
  </div>

  <div v-if="activeTab === 'payouts'" class="sections-container">
    <div class="section">
      <h2>Payout History</h2>
      <PayoutHistoryTable />
    </div>
  </div>
</template>

<style scoped>
  .sections-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
  }

  .section {
    min-width: 0; /* Prevents overflow issues */
  }

  .mlb-section {
    grid-column: 1 / -1; /* Spans all columns */
  }

  @media (max-width: 768px) {
    .sections-container {
      grid-template-columns: 1fr;
    }
  }
</style>