<script setup>
  import "@/styles/Footer.scss"

  const creationYear = 2023
  const year = new Date().getFullYear()

  var creationYearText;
  if (creationYear !== year) {
    creationYearText = `${creationYear}-`;
  }
</script>

<template>
  <div class="footer">
    <p>Copyright &copy; {{creationYearText}}{{year}} Montesano Fantasy Baseball. All rights reserved.</p>
  </div>
</template>