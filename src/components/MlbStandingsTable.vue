<script setup>
import { computed } from "vue";
import { formatAmericanOdds } from "@/data/season-2026.js";
import DataTable from "@/components/DataTable.vue";
import getTeamLogoURL from "@/scripts/mlb-team-logos.js";

const { division } = defineProps(["division"]);

function parseGamesBack(gamesBack) {
  return gamesBack === "-" ? 0 : Number(gamesBack);
}

function getRecordValue(record) {
  if (!record) {
    return null;
  }

  return (record.wins * 1000) - record.losses;
}

const rows = computed(() =>
  (division?.standings || []).slice().sort((left, right) => Number(left.divisionRank) - Number(right.divisionRank)),
);

const columns = [
  {
    key: "team",
    label: "Team",
    sortable: true,
    sortValue: (row) => row.team.name,
  },
  {
    key: "owner",
    label: "Owner",
    sortable: true,
    value: (row) => row.team.owner,
  },
  {
    key: "gamesBack",
    label: "GB",
    sortable: true,
    sortValue: (row) => parseGamesBack(row.gamesBack),
  },
  {
    key: "odds",
    label: "Odds",
    sortable: true,
    value: (row) => row.team.odds,
  },
  {
    key: "draftRound",
    label: "Round",
    sortable: true,
    value: (row) => row.team.draftRound,
  },
  {
    key: "fantasyPoints",
    label: "Pts",
    sortable: true,
    value: (row) => row.team.fantasyPoints,
  },
  {
    key: "wins",
    label: "W",
    sortable: true,
  },
  {
    key: "losses",
    label: "L",
    sortable: true,
  },
  {
    key: "winningPercentage",
    label: "PCT",
    sortable: true,
    sortValue: (row) => Number(row.winningPercentage),
  },
  {
    key: "home",
    label: "Home",
    sortable: true,
    value: (row) => row.records.home,
    sortValue: (row) => getRecordValue(row.records.home),
  },
  {
    key: "away",
    label: "Away",
    sortable: true,
    value: (row) => row.records.away,
    sortValue: (row) => getRecordValue(row.records.away),
  },
  {
    key: "lastTen",
    label: "L10",
    sortable: true,
    value: (row) => row.records.lastTen,
    sortValue: (row) => getRecordValue(row.records.lastTen),
  },
];
</script>

<template>
  <p v-if="!division"><b>MlbStandingsTable:</b> No division was provided.</p>
  <div v-if="division">
    <h2 class="mb-2 text-xl font-semibold">{{ division.name }}</h2>
    <DataTable :columns="columns" :rows="rows" :row-key="(row) => row.team.id" container-class="mb-7 overflow-x-auto">
      <template #cell-team="{ row }">
        <span class="whitespace-nowrap">
          <img class="mr-1 inline h-5 w-5 align-middle" :src="getTeamLogoURL(row.team.id)" />{{ row.team.name }}
        </span>
      </template>
      <template #cell-owner="{ row }">{{ row.team.owner }}</template>
      <template #cell-odds="{ row }">{{ formatAmericanOdds(row.team.odds) }}</template>
      <template #cell-draftRound="{ row }">{{ row.team.draftRound ?? "—" }}</template>
      <template #cell-fantasyPoints="{ row }">{{ row.team.fantasyPoints }}</template>
      <template #cell-home="{ row }">{{ row.records.home?.wins ?? "—" }}-{{ row.records.home?.losses ?? "—" }}</template>
      <template #cell-away="{ row }">{{ row.records.away?.wins ?? "—" }}-{{ row.records.away?.losses ?? "—" }}</template>
      <template #cell-lastTen="{ row }">{{ row.records.lastTen?.wins ?? "—" }}-{{ row.records.lastTen?.losses ?? "—" }}</template>
    </DataTable>
  </div>
</template>
