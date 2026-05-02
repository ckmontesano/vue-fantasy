import { createApp } from "vue";
import App from "./App.vue";
import { initializeThemeSettings } from "@/composables/useThemeSettings.js";
import "@/styles/tailwind.css";

initializeThemeSettings();

createApp(App).mount("#app");
