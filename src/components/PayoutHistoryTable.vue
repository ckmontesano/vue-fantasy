<script setup>
// dependencies
import { usePayoutHistory } from "@/composables/usePayoutHistory.js";

const { payoutHistory } = usePayoutHistory();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full border-collapse text-sm">
    <thead>
      <tr class="bg-zinc-300 dark:bg-zinc-700">
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Date</th>
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Winner</th>
        <th class="whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(entry, index) in payoutHistory" :key="index" class="odd:bg-zinc-100 odd:dark:bg-zinc-800/70">
        <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ entry.date }}</td>
        <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">{{ entry.winner }}</td>
        <td class="whitespace-nowrap border border-zinc-500/50 px-3 py-2">${{ entry.amount }}</td>
      </tr>
    </tbody>
  </table>
  </div>
</template>
