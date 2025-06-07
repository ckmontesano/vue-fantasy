<script setup>
  import { ref } from 'vue'
  import '@/styles/NavigationBar.scss'
  import baseballIcon from '@/assets/baseball.png'

  const year = new Date().getFullYear();

  const mobileNavHidden = ref(true);
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
        <div class='mobile-menu-toggle' @click="mobileNavHidden = !mobileNavHidden">
          <img src="@/assets/hamburger.png" draggable="false" />
        </div>
      </a>
      <ul class='options' :class="{ 'mobile-hidden': mobileNavHidden }">
        <li class='item'>
          <a @click="mobileNavHidden = true" href='#/'>Home</a>
        </li>
        <li class='item'>
          <a @click="mobileNavHidden = true" href='#/teams'>Teams</a>
        </li>
        <li class='item'>
          <a @click="mobileNavHidden = true" href='#/mlb-standings'>MLB Standings</a>
        </li>
        <li class='item'>
          <a @click="mobileNavHidden = true" href='https://mlb.tv' target='_blank'>MLB.TV</a>
        </li>
      </ul>
      <!--
        todo: work in authentication at some point
      <div class='user-info'>
        Signed in as <b>Cameron</b>. <a href='#/logout'>Logout</a>
      </div> -->
    </div>
  </div>
  <div class='status-bar marquee'>
    <p>Last MLB data update: 6/12/2025 at 8:15pm</p>
  </div>
</template>