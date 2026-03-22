<script setup>
const creationYear = 2023;
const year = new Date().getFullYear();

let creationYearText;
if (creationYear !== year) {
  creationYearText = `${creationYear}-`;
}
</script>

<template>
  <footer class="w-full bg-zinc-200 px-2 py-8 pb-12 text-center sm:px-6 md:px-8 md:py-12 md:pb-16 dark:bg-zinc-900">
    <p class="m-0 text-sm text-zinc-600 dark:text-zinc-300">
      Copyright &copy; {{ creationYearText }}{{ year }} Montesano Fantasy Baseball. All rights reserved.
    </p>
  </footer>
</template>
