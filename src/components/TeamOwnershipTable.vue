<script setup>
import { computed } from "vue";
import { formatAmericanOdds } from "@/data/season-2026.js";
import DataTable from "@/components/DataTable.vue";
import getTeamLogoURL from "@/scripts/mlb-team-logos.js";

const { teams } = defineProps(["teams"]);

function parseGamesBack(gamesBack) {
  return gamesBack === "-" ? 0 : Number(gamesBack);
}

const rows = computed(() =>
  (teams || []).slice().sort((left, right) => Number(left.divisionRank) - Number(right.divisionRank)),
);

const columns = [
  {
    key: "team",
    label: "Team",
    sortable: true,
    sortValue: (row) => row.team.name,
  },
  {
    key: "draftRound",
    label: "Round",
    sortable: true,
    value: (row) => row.team.draftRound,
  },
  {
    key: "odds",
    label: "Odds",
    sortable: true,
    value: (row) => row.team.odds,
  },
  {
    key: "divisionRank",
    label: "Place in Division",
    sortable: true,
    sortValue: (row) => Number(row.divisionRank),
  },
  {
    key: "gamesBack",
    label: "Games Back",
    sortable: true,
    sortValue: (row) => parseGamesBack(row.gamesBack),
  },
  {
    key: "fantasyPoints",
    label: "Draft Points",
    sortable: true,
    value: (row) => row.team.fantasyPoints,
  },
];
</script>

<template>
  <DataTable :columns="columns" :rows="rows" :row-key="(row) => row.team.id">
    <template #cell-team="{ row }">
      <span class="whitespace-nowrap">
        <img class="mr-1 inline h-5 w-5 align-middle" :src="getTeamLogoURL(row.team.id)" />
        {{ row.team.name }}
      </span>
    </template>
    <template #cell-draftRound="{ row }">{{ row.team.draftRound ?? "—" }}</template>
    <template #cell-odds="{ row }">{{ formatAmericanOdds(row.team.odds) }}</template>
    <template #cell-fantasyPoints="{ row }">{{ row.team.fantasyPoints }}</template>
  </DataTable>
</template>
