<script setup>
  // dependencies & components
  import '@/styles/app.scss';
  import NavigationBar from '@/components/NavigationBar.vue'
  import Footer from '@/components/Footer.vue';

  // pages
  import HomePage from '@/pages/HomePage.vue';
  import TeamsPage from '@/pages/TeamsPage.vue';
  import AllStarBreakPage from '@/pages/AllStarBreakPage.vue';
  import MLBStandings from '@/pages/MLBStandings.vue';
  import NotFound from '@/pages/NotFound.vue';

  // routing - https://vuejs.org/guide/scaling-up/routing
  import { ref, computed } from 'vue';
  const routes = {
    '/': HomePage,
    '/teams': TeamsPage,
    '/all-star-break': AllStarBreakPage,
    '/mlb-standings': MLBStandings,
  }
  const currentPath = ref(window.location.hash)
  window.addEventListener('hashchange', () => {
    currentPath.value = window.location.hash
  })
  const currentView = computed(() => {
    return routes[currentPath.value.slice(1) || '/'] || NotFound
  });
</script>

<template>
  <NavigationBar />
  <div class='page'>
    <component :is='currentView' />
  </div>
  <Footer />
</template>

