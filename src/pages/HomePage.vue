<script setup>
// components
import MlbDivisionLeadersTable from "@/components/MlbDivisionLeadersTable.vue";
import FantasyStandingsTable from "@/components/FantasyStandingsTable.vue";
import PayoutHistoryTable from "@/components/PayoutHistoryTable.vue";
import TabsComponent from "@/components/TabsComponent.vue";
import { ref } from "vue";

import { computed } from "vue";
import { usePayoutHistory } from "@/composables/usePayoutHistory.js";

const { payoutHistory } = usePayoutHistory();

const people = computed(() => {
  const set = new Set();
  payoutHistory.value.forEach((row) => {
    set.add(row.winner);
    if (row.losers) row.losers.forEach((loser) => set.add(loser));
  });
  return Array.from(set);
});

const balances = computed(() => {
  const bal = Object.fromEntries(people.value.map((p) => [p, 0]));
  payoutHistory.value.forEach((row) => {
    if (row.losers) {
      row.losers.forEach((loser) => {
        bal[loser] -= 20;
        bal[row.winner] += 20;
      });
    }
  });
  return bal;
});

const activeTab = ref("standings");
const tabs = [
  { id: "standings", label: "Standings" },
  { id: "payouts", label: "Balances and Payouts" },
];
</script>

<template>
  <h1>Home</h1>
  <TabsComponent v-model="activeTab" :tabs="tabs" />

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
  <div v-if="activeTab === 'payouts'" class="thirds-container">
    <div class="section third-section">
      <h2>Balances</h2>
      <table class="balances-table">
        <thead>
          <tr>
            <th>Person</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="person in people" :key="person">
            <td>{{ person }}</td>
            <td
              :style="{
                color:
                  balances[person] > 0
                    ? '#228B22'
                    : balances[person] < 0
                    ? '#B22222'
                    : 'inherit',
                fontWeight: 'bold',
              }">
              {{
                balances[person] > 0 ? "+$" : balances[person] < 0 ? "-$" : "$"
              }}{{ Math.abs(balances[person]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="section third-section">
      <h2>Payout History</h2>
      <PayoutHistoryTable />
    </div>
  </div>
</template>

<style scoped>
.thirds-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 8px;
}
.third-section {
  flex: 0 1 auto;
  min-width: 350px;
  box-sizing: border-box;
  margin-bottom: 0;
}
@media (max-width: 900px) {
  .thirds-container {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 16px; /* Reduce gap on mobile */
  }
  .third-section {
    min-width: 0;
    width: 100%;
    margin-bottom: 8px; /* Reduce space below payout history on mobile */
  }
}
.balances-payouts-inline {
  width: 100%;
  white-space: normal;
}
.balances-section,
.payouts-section {
  display: inline-block;
  vertical-align: top;
  width: auto;
  min-width: 300px;
  margin-right: 32px;
}
.payouts-section {
  margin-right: 0;
}
@media (max-width: 900px) {
  .balances-section,
  .payouts-section {
    display: block;
    width: 100%;
    margin-right: 0;
  }
}
.balances-payouts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) {
  .balances-payouts-container {
    grid-template-columns: 1fr;
  }
}
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
