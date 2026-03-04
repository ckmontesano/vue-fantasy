import { ref, onMounted } from "vue";
import getMlbStandings from "@/scripts/mlb-standings.js";

export function useMlbStandings() {
  const mlbStandings = ref(null);
  const isLoading = ref(true);
  const error = ref(null);

  onMounted(async () => {
    try {
      mlbStandings.value = await getMlbStandings();
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  });

  return {
    mlbStandings,
    isLoading,
    error,
  };
}
