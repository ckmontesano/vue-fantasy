<script setup>
  import { ref } from 'vue'
  import '@/styles/NavigationBar.scss'
  import baseballIcon from '@/assets/baseball.png'
  import mlbData from '@/data/mlb-2025.json'

  const year = mlbData?.metadata?.season ?? 2025;

  const mobileNavHidden = ref(true);

  const toggleMobileNav = () => {
    mobileNavHidden.value = !mobileNavHidden.value;
  };

  const closeMobileNav = () => {
    mobileNavHidden.value = true;
  };
</script>

<template>
  <div class='navigation-bar'>
    <div class='nav-wrapper'>
      <a href='#/' class='branding'>
        <img class='logo' :src='baseballIcon' draggable='false' />
        <div class='text-container'>
          <span class='main'>Montesano</span>
          <span class='secondary'>Fantasy Baseball {{year}}</span>
        </div>
      </a>
      <button
        class='mobile-menu-toggle'
        type='button'
        aria-label='Toggle navigation'
        @click="toggleMobileNav">
        <img src="@/assets/hamburger.png" draggable="false" />
      </button>
      <ul class='options' :class="{ 'mobile-hidden': mobileNavHidden }">
        <li class='item'>
          <a @click="closeMobileNav" href='#/'>Home</a>
        </li>
        <li class='item'>
          <a @click="closeMobileNav" href='#/teams'>Teams</a>
        </li>
        <li class='item'>
          <a @click="closeMobileNav" href='#/all-star-break'>All-Star Break</a>
        </li>
        <li class='item'>
          <a @click="closeMobileNav" href='#/mlb-standings'>MLB Standings</a>
        </li>
      </ul>
    </div>
  </div>
  <div class='status-bar marquee'>
    <p>Last MLB data update: 6/12/2025 at 8:15pm</p>
  </div>
</template>
