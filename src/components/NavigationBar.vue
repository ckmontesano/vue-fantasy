<script setup>
  import { ref } from 'vue'
  import '@/styles/NavigationBar.scss'
  import baseballIcon from '@/assets/baseball.png'

  const year = new Date().getFullYear();

  const mobileNavHidden = ref(true);
</script>

<template>
  <div class='navigation-bar'>
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
  <div class='status-bar marquee'>
    <p>Last MLB data update: 6/12/2025 at 8:15pm</p>
  </div>
</template>

<style scoped>
  .branding {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    position: relative;
    width: 100%;
  }
  .mobile-menu-toggle {
    display: none;  /* Hidden by default */
    height: 100%;
    max-height: 48px;
    aspect-ratio: 1/1;
    padding: 12px;
    position: absolute;
    right: 0;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  .mobile-menu-toggle img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .options {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    white-space: nowrap;
  }

  .options .item {
    margin: 0 1rem;
  }

  .options .item a {
    text-decoration: none;
    color: inherit;
    padding: 0.5rem 0;
    display: block;
    transition: color 0.2s ease;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: flex;
      padding: 8px;
    }
    
    .options {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      background: #f2f2f2;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1;
      padding: 1rem 0;
      white-space: normal;
    }

    .options .item {
      margin: 0;
      width: 100%;
    }

    .options .item a {
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid #eee;
      color: #2e2e2e;
      text-align: right;
      white-space: normal;
    }

    .options .item a:hover {
      color: #585858;
    }

    .options .item:last-child a {
      border-bottom: none;
    }

    .mobile-hidden {
      display: none;
    }
  }
</style>