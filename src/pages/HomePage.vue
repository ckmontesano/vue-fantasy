<script setup>
// components
import { STAKES } from "@/data/season-2026.js";
import AppModal from "@/components/AppModal.vue";
import DataTable from "@/components/DataTable.vue";
import MlbDivisionLeadersTable from "@/components/MlbDivisionLeadersTable.vue";
import FantasyStandingsTable from "@/components/FantasyStandingsTable.vue";
import PayoutHistoryTable from "@/components/PayoutHistoryTable.vue";
import TabsComponent from "@/components/TabsComponent.vue";
import { ref } from "vue";

const activeTab = ref("standings");
const isDisputeModalOpen = ref(false);
const tabs = [
  { id: "standings", label: "Standings" },
  { id: "payouts", label: "Pools and Payouts" },
];

const poolsColumns = [
  { key: "pool", label: "Pool", sortable: true },
  { key: "stake", label: "Stake", sortable: true },
  { key: "payout", label: "Payout", sortable: true },
];

const poolsRows = [
  {
    pool: "Regular Season",
    stake: `$${STAKES.monthly.wager}/person each month`,
    payout: `$${STAKES.monthly.payout} monthly winner`,
  },
  {
    pool: "All-Star Break",
    stake: `$${STAKES.allStar.wager}/person`,
    payout: `$${STAKES.allStar.payout} winner`,
  },
  {
    pool: "Playoffs",
    stake: `$${STAKES.playoffs.wager}/person`,
    payout: "Separate playoff pool",
  },
  {
    pool: "Season Total",
    stake: `$${STAKES.totalCommitment}/person`,
    payout: "Collected up front on draft day",
  },
];

function getPoolsRowClass(row, rowIndex) {
  const baseClass = "odd:bg-zinc-100 odd:dark:bg-zinc-800/70";

  return rowIndex === poolsRows.length - 1 ? `${baseClass} font-semibold` : baseClass;
}

function openDisputeModal() {
  isDisputeModalOpen.value = true;
}
</script>

<template>
  <div class="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <h1 class="text-4xl font-semibold tracking-tight">Home</h1>
    <button
      type="button"
      class="accent-focus accent-outline-button inline-flex items-center self-start rounded-md border px-3 py-2 text-sm font-semibold transition"
      @click="openDisputeModal">
      Dispute Standings
    </button>
  </div>
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
      <h2 class="mb-2 text-2xl font-semibold">Pools / Stakes</h2>
      <DataTable
        :columns="poolsColumns"
        :rows="poolsRows"
        row-key="pool"
        :row-class="getPoolsRowClass" />
      <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        March does not count toward monthly regular-season winners.
      </p>
    </div>
    <div class="mb-2 min-w-0 flex-1 md:min-w-[350px]">
      <h2 class="mb-2 text-2xl font-semibold">Payout History</h2>
      <PayoutHistoryTable />
    </div>
  </div>

  <AppModal v-model="isDisputeModalOpen" title="Standing Dispute">
    <p class="text-base">Go fuck yourself I'm the commissioner 🖕</p>
  </AppModal>
</template>
