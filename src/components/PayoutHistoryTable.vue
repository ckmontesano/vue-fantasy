<script setup>
// dependencies
import { usePayoutHistory } from "@/composables/usePayoutHistory.js";

const { payoutHistory } = usePayoutHistory();
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Winner</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(entry, index) in payoutHistory" :key="index">
        <td>{{ entry.date }}</td>
        <td>{{ entry.winner }}</td>
        <td>${{ entry.amount }}</td>
      </tr>
    </tbody>
  </table>
</template>
