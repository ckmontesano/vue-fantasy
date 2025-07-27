<script setup>
// dependencies
import { ref, onMounted } from "vue";
import TabsComponent from "@/components/TabsComponent.vue";
import { getAllStarBreakData } from "@/scripts/allstar-break-logic.js";

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

  console.log(mlbStandings.value);
});
</script>

<template>
  <h1>All-Star Break</h1>

  <h2>Points Overview</h2>
  <table style="margin-bottom: 2rem">
    <thead>
      <tr>
        <td>Owner</td>
        <td>Points</td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(points, owner) in ownerPoints" :key="owner">
        <td>{{ owner }}</td>
        <td>{{ points }}</td>
      </tr>
    </tbody>
  </table>

  <TabsComponent
    v-model="activeTab"
    :tabs="tabs"
    @update:modelValue="updateActiveTab" />

  <div v-show="activeTab === 'allstar'">
    <p>
      Players elected to the active roster for each All-Star team will each earn
      <b>6</b> points for the owner of the team they’re on, <b>6</b> extra
      points if their team (AL/NL) wins the All-Star game.
    </p>

    <!-- League Tabs for mobile (smaller sub-tabs, only visible on mobile) -->
    <div class="mobile-league-tabs">
      <TabsComponent
        v-model="activeLeagueTab"
        :tabs="leagueTabs"
        @update:modelValue="updateLeagueTab"
        class="sub-tabs" />

      <div v-show="activeLeagueTab === 'al'">
        <div>
          <table>
            <thead>
              <tr>
                <td>Player</td>
                <td>Team</td>
                <td>Beneficiary</td>
                <td>Points</td>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, key) in allStarPlayers.filter(
                  (p) => p.teamName && p.asgTeamName === 'American League'
                )"
                :key="key">
                <td>{{ player.fullName }}</td>
                <td>{{ player.teamName }}</td>
                <td>{{ getOwner(player.teamName) }}</td>
                <td>6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-show="activeLeagueTab === 'nl'">
        <div>
          <table>
            <thead>
              <tr>
                <td>Player</td>
                <td>Team</td>
                <td>Beneficiary</td>
                <td>Points</td>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, key) in allStarPlayers.filter(
                  (p) => p.teamName && p.asgTeamName === 'National League'
                )"
                :key="key">
                <td>{{ player.fullName }}</td>
                <td>{{ player.teamName }}</td>
                <td>{{ getOwner(player.teamName) }}</td>
                <td>12</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Desktop: show both tables side-by-side -->
    <div class="desktop-league-tables">
      <div class="row">
        <div class="loser">
          <h3>American League</h3>
          <table>
            <thead>
              <tr>
                <td>Player</td>
                <td>Team</td>
                <td>Beneficiary</td>
                <td>Points</td>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, key) in allStarPlayers.filter(
                  (p) => p.teamName && p.asgTeamName === 'American League'
                )"
                :key="key">
                <td>{{ player.fullName }}</td>
                <td>{{ player.teamName }}</td>
                <td>{{ getOwner(player.teamName) }}</td>
                <td>6</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3>National League 🏆</h3>
          <table>
            <thead>
              <tr>
                <td>Player</td>
                <td>Team</td>
                <td>Beneficiary</td>
                <td>Points</td>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, key) in allStarPlayers.filter(
                  (p) => p.teamName && p.asgTeamName === 'National League'
                )"
                :key="key">
                <td>{{ player.fullName }}</td>
                <td>{{ player.teamName }}</td>
                <td>{{ getOwner(player.teamName) }}</td>
                <td>12</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div v-show="activeTab === 'hrd'">
    <p>We did not select winners this year, so no points will be awarded.</p>
    <img
      class="hrd-graphic"
      src="https://img.mlbstatic.com/mlb-images/image/upload/t_16x9/t_w1536/mlb/xaecfgfddqtw9iiymd4h.jpg" />
  </div>
</template>

<style scoped>
/* Mobile: show tabs, hide side-by-side tables */
.mobile-league-tabs {
  display: none;
}
.desktop-league-tables {
  display: block;
}
@media (max-width: 768px) {
  .mobile-league-tabs {
    display: block;
  }
  .desktop-league-tables {
    display: none;
  }
}
.sub-tabs {
  margin-bottom: 1rem;
  font-size: 0.85em;
  padding: 0.25em 0;
}
.row {
  display: flex;
  flex-direction: row;
  gap: 40px;

  &.even {
    > * {
      flex: 1;
    }
  }
}
.hrd-graphic {
  max-width: 100%;
  border: solid 2px black;
}
</style>
