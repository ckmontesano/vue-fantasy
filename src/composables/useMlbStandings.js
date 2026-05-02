import { ref, onMounted } from "vue";
import getMlbStandings from "@/scripts/mlb-standings.js";

const mlbStandings = ref(null);
const lastFetchedAt = ref(null);
const isLoading = ref(false);
const error = ref(null);

let hasLoaded = false;
let pendingRequest = null;

async function loadMlbStandings(options = {}) {
  if (pendingRequest) {
    return pendingRequest;
  }

  isLoading.value = true;
  error.value = null;

  pendingRequest = getMlbStandings(options)
    .then((payload) => {
      mlbStandings.value = payload.standings;
      lastFetchedAt.value = payload.fetchedAt;
      hasLoaded = true;
      return payload;
    })
    .catch((err) => {
      error.value = err;
      throw err;
    })
    .finally(() => {
      isLoading.value = false;
      pendingRequest = null;
    });

  return pendingRequest;
}

export function useMlbStandings() {
  onMounted(() => {
    if (!hasLoaded) {
      loadMlbStandings().catch(() => {});
    }
  });

  return {
    mlbStandings,
    lastFetchedAt,
    isLoading,
    error,
    refreshMlbStandings: () => loadMlbStandings({ forceRefresh: true }),
  };
}
