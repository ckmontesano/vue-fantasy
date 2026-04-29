import { ref, onMounted } from "vue";
import mlbData from "@/data/mlb-2025.json";

export function usePayoutHistory() {
  const payoutHistory = ref([]);

  onMounted(() => {
    payoutHistory.value = mlbData.payoutHistory || [];
  });

  return { payoutHistory };
}
