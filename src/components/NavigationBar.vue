<script setup>
  import '@/styles/NavigationBar.css'
  import baseballIcon from '@/assets/baseball.png'

  const year = new Date().getFullYear();
</script>

<template>
  <div class='navigation-bar'>
    <div class='branding'>
      <img class='logo' :src='baseballIcon' draggable='false' />
      <div class='text-container'>
        <span class='main'>Montesano</span>
        <span class='secondary'>Fantasy Baseball {{year}}</span>
      </div>
    </div>
    <ul class='options'>
      <li class='item'>
        <a href='#/'>Home</a>
      </li>
      <li class='item'>
        <a href='#/teams'>Teams</a>
      </li>
      <li class='item'>
        <a href='#/mlb-standings'>MLB Standings</a>
      </li>
    </ul>
    <!--
      todo: work in authentication at some point
    <div class='user-info'>
      Signed in as <b>Cameron</b>. <a href='#/logout'>Logout</a>
    </div> -->
  </div>
  <div class='status-bar marquee'>
    <p>Last MLB data update: 6/12/2025 at 8:15pm</p>
  </div>
</template>
