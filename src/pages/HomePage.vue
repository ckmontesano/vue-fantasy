<script setup>
// components
import MlbDivisionLeadersTable from "@/components/MlbDivisionLeadersTable.vue";
import FantasyStandingsTable from "@/components/FantasyStandingsTable.vue";
import PayoutHistoryTable from "@/components/PayoutHistoryTable.vue";
import TabsComponent from "@/components/TabsComponent.vue";
import { ref, computed } from "vue";
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
  <h1 class="my-2 text-4xl font-semibold tracking-tight">Home</h1>
  <TabsComponent v-model="activeTab" :tabs="tabs" />

  <div v-if="activeTab === 'standings'" class="grid gap-5 md:grid-cols-3">
    <div class="min-w-0 md:col-span-1">
      <h2 class="mb-2 text-2xl font-semibold">Fantasy Standings</h2>
      <FantasyStandingsTable />
    </div>
    <div class="min-w-0 md:col-span-3">
      <h2 class="mb-2 text-2xl font-semibold">MLB Division Leaders</h2>
      <MlbDivisionLeadersTable />
    </div>
  </div>
  <div v-if="activeTab === 'payouts'" class="flex flex-col items-start gap-4 pb-2 md:flex-row md:gap-10">
    <div class="mb-2 min-w-0 flex-1 md:min-w-[350px]">
      <h2 class="mb-2 text-2xl font-semibold">Balances</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse text-sm">
        <thead>
          <tr class="bg-zinc-300 dark:bg-zinc-700">
            <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Person</th>
            <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="person in people" :key="person" class="odd:bg-zinc-100 odd:dark:bg-zinc-800/70">
            <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ person }}</td>
            <td
              class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 font-bold"
              :class="
                balances[person] > 0
                  ? 'text-green-600 dark:text-green-400'
                  : balances[person] < 0
                    ? 'text-red-600 dark:text-red-400'
                    : ''
              ">
              {{
                balances[person] > 0 ? "+$" : balances[person] < 0 ? "-$" : "$"
              }}{{ Math.abs(balances[person]) }}
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
    <div class="mb-2 min-w-0 flex-1 md:min-w-[350px]">
      <h2 class="mb-2 text-2xl font-semibold">Payout History</h2>
      <PayoutHistoryTable />
    </div>
  </div>
</template>
