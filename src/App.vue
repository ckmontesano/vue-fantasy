<script setup>
import "@/styles/app.css";
import NavigationBar from "@/components/NavigationBar.vue"
import Footer from "@/components/Footer.vue";
import mlbStandingsVue from "./pages/mlb-standings.vue";
</script>

<template>
  <NavigationBar />
  <div class="page">
    <mlbStandingsVue />
  </div>
  <Footer />
</template>

