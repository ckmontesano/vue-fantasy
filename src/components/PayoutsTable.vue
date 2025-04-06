<script setup>
  import { ref } from 'vue'
  console.log("hello");

  var counter = ref(0)
</script>

<template>
  <div class="payouts-table-container">
    <h1>Payouts Table</h1>
    <p>The counter is {{counter}}</p>
    <button @click="counter++">Click me</button>
  </div>
</template>

<style scoped>
  .payouts-table-container {
    border: solid 2px black;
    padding: 24px;
  }
</style>