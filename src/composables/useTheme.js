import { ref, computed, onMounted } from "vue";

const theme = ref("light");

let mediaQuery;
let initialized = false;

function applyTheme() {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.removeAttribute("data-theme");
  root.style.colorScheme = theme.value;
}

function handleSystemChange(event) {
  theme.value = event.matches ? "dark" : "light";
  applyTheme();
}

function initTheme() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  theme.value = mediaQuery.matches ? "dark" : "light";
  applyTheme();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleSystemChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleSystemChange);
  }

  initialized = true;
}

export function useTheme() {
  initTheme();

  onMounted(() => {
    applyTheme();
  });

  const systemTheme = computed(() => {
    if (!mediaQuery) return "light";
    return mediaQuery.matches ? "dark" : "light";
  });

  return {
    theme,
    systemTheme,
  };
}
