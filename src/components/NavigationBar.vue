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
        <a href='#/mlb-standings'>MLB Standings</a>
      </li>
      <li class='item'>
        <a href='#/draft-results'>Draft Results</a>
      </li>
      <li class='item'>
        <a href='#/trade'>Trade</a>
      </li>
    </ul>
  </div>
</template>
