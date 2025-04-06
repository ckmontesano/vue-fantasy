<script setup>
  import "@/styles/Footer.css"

  const creationYear = 2023
  const year = new Date().getFullYear()

  var creationYearText;
  if (creationYear !== year) {
    creationYearText = `${creationYear}-`;
  }
</script>

<template>
  <div class="footer">
    <p>Copyright &copy; {{creationYearText}}{{year}} Cameron Montesano. All rights reserved.</p>
  </div>
</template>