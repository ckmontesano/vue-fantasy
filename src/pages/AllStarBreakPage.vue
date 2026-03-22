<script setup>
// dependencies
import { ref, onMounted } from "vue";
import TabsComponent from "@/components/TabsComponent.vue";
import { getAllStarBreakData } from "@/scripts/allstar-break-logic.js";
import hrdGraphic from "@/assets/hrd-2025.jpg";

// Tabs setup
const tabs = [
  { id: "allstar", label: "All-Star Game" },
  { id: "hrd", label: "Home Run Derby" },
];
const activeTab = ref("allstar");
function updateActiveTab(tabId) {
  activeTab.value = tabId;
}

// League tabs for mobile
const leagueTabs = [
  { id: "al", label: "American League" },
  { id: "nl", label: "National League 👑" },
];
const activeLeagueTab = ref("al");
function updateLeagueTab(tabId) {
  activeLeagueTab.value = tabId;
}

const mlbStandings = ref(null);
const allStarPlayers = ref([]);
const ownerPoints = ref({});

function getOwner(teamName) {
  if (!mlbStandings.value) return "—";
  const leagues = ["american", "national"];
  const divisions = ["east", "central", "west"];
  const normalizedTarget = teamName?.toLowerCase().trim();
  for (const league of leagues) {
    for (const division of divisions) {
      const teams = mlbStandings.value?.[league]?.[division]?.standings || [];
      for (const team of teams) {
        const nameA = team.team?.name?.toLowerCase().trim();
        const nameB = team.teamName?.toLowerCase().trim();
        if (nameA === normalizedTarget || nameB === normalizedTarget) {
          return team.team.owner || "—";
        }
      }
    }
  }
  return "—";
}

onMounted(async () => {
  const {
    mlbStandings: standings,
    allStarPlayers: players,
    ownerPoints: points,
  } = await getAllStarBreakData();
  mlbStandings.value = standings;
  allStarPlayers.value = players;
  ownerPoints.value = points;

});
</script>

<template>
  <h1 class="my-2 text-4xl font-semibold tracking-tight">All-Star Break</h1>

  <h2 class="mb-2 text-2xl font-semibold">Points Overview</h2>
  <div class="mb-8 overflow-x-auto">
    <table class="min-w-full border-collapse text-sm md:min-w-[420px]">
    <thead>
      <tr class="bg-zinc-300 dark:bg-zinc-700">
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Owner</th>
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Points</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(points, owner) in ownerPoints" :key="owner" class="odd:bg-zinc-100 odd:dark:bg-zinc-800/70">
        <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ owner }}</td>
        <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ points }}</td>
      </tr>
    </tbody>
  </table>
  </div>

  <TabsComponent
    v-model="activeTab"
    :tabs="tabs"
    @update:modelValue="updateActiveTab" />

  <div v-show="activeTab === 'allstar'">
    <p class="mb-3">
      Players elected to the active roster for each All-Star team will each earn
      <b>6</b> points for the owner of the team they’re on, <b>6</b> extra
      points if their team (AL/NL) wins the All-Star game.
    </p>

    <!-- League Tabs for mobile (smaller sub-tabs, only visible on mobile) -->
    <div class="md:hidden">
      <TabsComponent
        v-model="activeLeagueTab"
        :tabs="leagueTabs"
        @update:modelValue="updateLeagueTab"
        class="mb-4 text-sm" />

      <div v-show="activeLeagueTab === 'al'">
        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="bg-zinc-300 dark:bg-zinc-700">
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Player</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Team</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Beneficiary</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, key) in allStarPlayers.filter(
                  (p) => p.teamName && p.asgTeamName === 'American League'
                )"
                :key="key">
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ player.fullName }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ player.teamName }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ getOwner(player.teamName) }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-show="activeLeagueTab === 'nl'">
        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="bg-zinc-300 dark:bg-zinc-700">
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Player</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Team</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Beneficiary</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, key) in allStarPlayers.filter(
                  (p) => p.teamName && p.asgTeamName === 'National League'
                )"
                :key="key">
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ player.fullName }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ player.teamName }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ getOwner(player.teamName) }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">12</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Desktop: show both tables side-by-side -->
    <div class="hidden md:block">
      <div class="flex flex-row gap-10">
        <div class="min-w-0 flex-1">
          <h3 class="mb-2 text-xl font-semibold">American League</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="bg-zinc-300 dark:bg-zinc-700">
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Player</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Team</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Beneficiary</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, key) in allStarPlayers.filter(
                  (p) => p.teamName && p.asgTeamName === 'American League'
                )"
                :key="key">
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ player.fullName }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ player.teamName }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ getOwner(player.teamName) }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">6</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="mb-2 text-xl font-semibold">National League 🏆</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse text-sm">
            <thead>
              <tr class="bg-zinc-300 dark:bg-zinc-700">
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Player</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Team</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Beneficiary</th>
                <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, key) in allStarPlayers.filter(
                  (p) => p.teamName && p.asgTeamName === 'National League'
                )"
                :key="key">
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ player.fullName }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ player.teamName }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ getOwner(player.teamName) }}</td>
                <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">12</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-show="activeTab === 'hrd'">
    <p>We did not select winners this year, so no points will be awarded.</p>
    <img
      class="max-w-full border-2 border-zinc-500/50"
      :src="hrdGraphic"
      alt="Home Run Derby" />
  </div>
</template>
