<script setup>
import { ref } from "vue";
import { useMlbStandings } from "@/composables/useMlbStandings.js";
import baseballIcon from "@/assets/baseball.png";

const mobileNavOpen = ref(false);
const isForceRefreshing = ref(false);
const { isLoading, lastFetchedAt, refreshMlbStandings } = useMlbStandings();

const toggleMobileNav = () => {
  mobileNavOpen.value = !mobileNavOpen.value;
};

const closeMobileNav = () => {
  mobileNavOpen.value = false;
};

const navLinks = [
  { href: "#/", label: "Home" },
  { href: "#/teams", label: "Teams" },
  { href: "#/all-star-break", label: "All-Star Break" },
  { href: "#/mlb-standings", label: "MLB Standings" },
  { href: "#/rules", label: "Rules" },
];

function formatLastUpdated(timestamp) {
  if (!timestamp) {
    return "Waiting for first MLB sync";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

async function handleForceRefresh() {
  const startedAt = Date.now();

  isForceRefreshing.value = true;

  try {
    await refreshMlbStandings();
  } catch {
    // Keep the navbar quiet if refresh fails; error state lives in the composable.
  } finally {
    const remainingDelay = 1000 - (Date.now() - startedAt);

    if (remainingDelay > 0) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, remainingDelay);
      });
    }

    isForceRefreshing.value = false;
  }
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-zinc-300/80 bg-white/95 text-zinc-900 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95 dark:text-zinc-100">
    <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-2 sm:px-6 md:px-8">
      <a href="#/" class="group flex items-center gap-3 text-inherit" @click="closeMobileNav">
        <img class="h-9 w-9" :src="baseballIcon" draggable="false" alt="Montesano Fantasy Baseball logo" />
        <div class="flex flex-col leading-tight">
          <span class="text-xl font-semibold tracking-tight">Montesano Fantasy Baseball</span>
          <span class="-mt-1.5 text-base text-zinc-600 dark:text-zinc-300">2026 Season</span>
        </div>
      </a>

      <button
        class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-100 md:hidden dark:border-zinc-600 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
        type="button"
        aria-label="Toggle navigation"
        @click="toggleMobileNav">
        <span class="text-lg">☰</span>
      </button>

      <nav
        class="absolute top-16 right-0 left-0 border-b border-zinc-300 bg-zinc-50 px-2 py-2 md:static md:border-0 md:bg-transparent md:p-0 dark:border-zinc-700 dark:bg-zinc-900 md:dark:bg-transparent"
        :class="mobileNavOpen ? 'block' : 'hidden md:block'">
        <ul class="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
          <li v-for="link in navLinks" :key="link.href">
            <a
              :href="link.href"
              class="block rounded-md px-3 py-2 font-semibold text-zinc-700 transition hover:bg-zinc-200 hover:text-zinc-900 md:py-1.5 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              @click="closeMobileNav">
              {{ link.label }}
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <div class="marquee hidden border-t border-zinc-300 bg-zinc-200/80 py-1.5 text-center text-xs text-zinc-700 md:block dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
      <p>
        Last MLB data update: {{ formatLastUpdated(lastFetchedAt) }}.
        <span class="ml-1">Data is stored for one hour.</span>
        <button
          type="button"
          class="ml-2 underline underline-offset-2 disabled:no-underline"
          :disabled="isLoading || isForceRefreshing"
          @click="handleForceRefresh">
          {{ isLoading || isForceRefreshing ? "Refreshing..." : "Force refresh" }}
        </button>
      </p>
    </div>
  </header>
</template>
