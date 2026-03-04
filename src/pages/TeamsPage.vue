<script setup>
  // dependencies
  import { ref, watch } from "vue"
  import { useMlbStandings } from "@/composables/useMlbStandings.js";

  // components
  import TeamOwnershipTable from "@/components/TeamOwnershipTable.vue";
  import TabsComponent from '@/components/TabsComponent.vue';

  // Constants for localStorage
  const STORAGE_KEY = "last_selected_person";

  const { mlbStandings } = useMlbStandings();
  const teams = ref({
    Cameron: [],
    Caden: [],
    Jack: [],
    Dad: [],
  })

  // Get the last selected person from localStorage, default to Cameron if not found
  const activeTab = ref(localStorage.getItem(STORAGE_KEY) || 'Cameron');

  // Update localStorage when activeTab changes
  function updateActiveTab(person) {
    activeTab.value = person;
    localStorage.setItem(STORAGE_KEY, person);
  }

  const tabs = [
    { id: 'Cameron', label: 'Cameron' },
    { id: 'Caden', label: 'Caden' },
    { id: 'Jack', label: 'Jack' },
    { id: 'Dad', label: 'Dad' }
  ];

  watch(mlbStandings, (standings) => {
    if (!standings) return;
    teams.value = {
      Cameron: [],
      Caden: [],
      Jack: [],
      Dad: [],
    };
    Object.values(standings).forEach((league) => {
      Object.values(league).forEach((division) => {
        division.standings.forEach((team) => {
          if (teams.value[team.team.owner]) {
            teams.value[team.team.owner].push(team);
          }
        });
      });
    });
  }, { immediate: true });
</script>

<template>
  <h1>Teams</h1>
  <TabsComponent
    v-model="activeTab"
    :tabs="tabs"
    @update:modelValue="updateActiveTab"
  />

  <div v-for="(personTeams, person) in teams" :key="person" v-show="activeTab === person">
    <TeamOwnershipTable :teams="personTeams" />
  </div>
</template>

<style scoped>
/* No styles needed as they're now in TabsComponent */
</style>
