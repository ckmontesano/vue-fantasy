<script setup>
  // components
  import MlbDivisionLeadersTable from '@/components/MlbDivisionLeadersTable.vue';
  import FantasyStandingsTable from '@/components/FantasyStandingsTable.vue';
  import PayoutHistoryTable from '@/components/PayoutHistoryTable.vue';
</script>
<template>
  <h1>Home</h1>
  <div class='col-2'>
    <div>
      <h2>MLB Division Leaders</h2>
      <MlbDivisionLeadersTable />
    </div>
    <div>
      <h2>Fantasy Standings</h2>
      <FantasyStandingsTable />
    </div>
  </div>
  <div class='center'>
    <h2>Payout History</h2>
    <PayoutHistoryTable />
  </div>
</template>

<style scoped>
  .col-2 {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .col-2 > div {
    flex: 1 0 auto; /* Distribute available space equally, initial size auto */
    box-sizing: border-box; /* Include padding and border in the element's total width and height */
  }

  .center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>