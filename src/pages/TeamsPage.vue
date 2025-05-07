<script setup>
  // dependencies
  import { ref, onMounted } from "vue"
  import getMlbStandings from "@/scripts/mlb-standings.js";

  import TeamOwnershipTable from "@/components/TeamOwnershipTable.vue";

  const mlbStandings = ref(null);
  const teams = ref({
    Cameron: [],
    Caden: [],
    Jack: [],
    Dad: [],
  })
  onMounted(async() => {
    mlbStandings.value = await getMlbStandings();
    Object.values(mlbStandings.value).forEach((league) => {
      Object.values(league).forEach((division) => {
        division.standings.forEach(team => {
          switch (team.team.owner) {
            case "Cameron":
              teams.value.Cameron.push(team);
              break;
            case "Caden":
              teams.value.Caden.push(team);
              break;
            case "Jack":
              teams.value.Jack.push(team);
              break;
            case "Dad":
              teams.value.Dad.push(team);
              break;
            default:
              break;
          }
        })
      });
    });
  })
</script>

<template>
  <h1>Teams</h1>
  <div v-for="(teams, person) in teams" :key="person">
    <h2>{{  person  }}</h2>
    <TeamOwnershipTable :teams="teams" />
  </div>
</template>
