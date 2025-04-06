<script setup>
import "@/styles/NavigationBar.css"
import baseballIcon from "@/assets/baseball.png"

const year = new Date().getFullYear();
</script>

<template>
  <div class="navigation-bar">
    <div class="branding">
      <img class="logo" :src="baseballIcon" draggable="false" />
      <div class="text-container">
        <span class="main">Montesano</span>
        <span class="secondary">Fantasy Baseball {{year}}</span>
      </div>
    </div>
    <ul class="options">
      <li class="item">
        Home
      </li>
      <li class="item">
        MLB Standings
      </li>
      <li class="item">
        Draft Results
      </li>
      <li class="item">
        Trade
      </li>
    </ul>
  </div>
</template>
