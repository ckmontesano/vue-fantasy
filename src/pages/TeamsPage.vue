<script setup>
  // dependencies
  import { ref, onMounted } from "vue"
  import getMlbStandings from "@/scripts/mlb-standings.js";

  import TeamOwnershipTable from "@/components/TeamOwnershipTable.vue";

  const mlbStandings = ref(null);
  onMounted(async() => {
    mlbStandings.value = await getMlbStandings();
  })

</script>

<template>
  <h1>Teams</h1>
  <div>
    <h2>Cameron</h2>
    <TeamOwnershipTable />
  </div>
  <div>
    <h2>Cade</h2>
    <TeamOwnershipTable />
  </div>
  <div>
    <h2>Jack</h2>
    <TeamOwnershipTable />
  </div>
  <div>
    <h2>Dad</h2>
    <TeamOwnershipTable />
  </div>

</template>