<script setup>
import { computed } from "vue";
import { formatAmericanOdds } from "@/data/season-2026.js";
import DataTable from "@/components/DataTable.vue";
import { useMlbStandings } from "@/composables/useMlbStandings.js";
import getTeamLogoURL from "@/scripts/mlb-team-logos.js";

const { mlbStandings } = useMlbStandings();

const columns = [
  {
    key: "divisionName",
    label: "Division",
    sortable: true,
    sortValue: (row) => row.divisionOrder,
  },
  {
    key: "leaderName",
    label: "Leader",
    sortable: true,
  },
  {
    key: "owner",
    label: "Owner",
    sortable: true,
  },
  {
    key: "odds",
    label: "Odds",
    sortable: true,
  },
  {
    key: "points",
    label: "Points",
    sortable: true,
  },
];

const divisionRows = computed(() => {
  if (!mlbStandings.value) {
    return [];
  }

  const orderedDivisions = [
    mlbStandings.value.american.east,
    mlbStandings.value.american.central,
    mlbStandings.value.american.west,
    mlbStandings.value.national.east,
    mlbStandings.value.national.central,
    mlbStandings.value.national.west,
  ];

  return orderedDivisions.map((division, index) => ({
    divisionOrder: index,
    divisionName: division.name.replace("American League", "AL").replace("National League", "NL"),
    leader: division.leader,
    leaderName: division.leader?.team?.name || "—",
    owner: division.leader?.team?.owner || "—",
    odds: division.leader?.team?.odds ?? null,
    points: division.leader?.team?.fantasyPoints ?? null,
  }));
});
</script>

<template>
  <DataTable v-if="mlbStandings" :columns="columns" :rows="divisionRows" row-key="divisionName">
    <template #cell-leaderName="{ row }">
      <span v-if="row.leader" class="whitespace-nowrap">
        <img class="mr-1 inline h-5 w-5 align-middle" :src="getTeamLogoURL(row.leader.team.id)" />
        {{ row.leader.team.name }}
      </span>
      <span v-else>—</span>
    </template>
    <template #cell-odds="{ row }">{{ row.odds == null ? "—" : formatAmericanOdds(row.odds) }}</template>
    <template #cell-points="{ row }">{{ row.points ?? "—" }}</template>
  </DataTable>
  <p v-else>Loading…</p>
  <a class="mt-2 block" href="#/mlb-standings">See full standings →</a>
</template>
