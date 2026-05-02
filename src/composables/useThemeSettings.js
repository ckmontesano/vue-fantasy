import { computed, reactive } from "vue";

const STORAGE_KEY = "theme-settings";
const DEFAULT_SETTINGS = {
  themeMode: "system",
  darkThemeVariant: "default",
  accentColor: "blue",
};
const VALID_THEME_MODES = new Set(["system", "light", "dark"]);
const VALID_DARK_VARIANTS = new Set(["default", "midnight"]);
const VALID_ACCENTS = new Set(["blue", "red", "orange", "purple"]);

const settings = reactive({ ...DEFAULT_SETTINGS });
let initialized = false;
let mediaQuery = null;

function readStoredSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(rawValue);

    return {
      themeMode: VALID_THEME_MODES.has(parsed?.themeMode) ? parsed.themeMode : DEFAULT_SETTINGS.themeMode,
      darkThemeVariant: VALID_DARK_VARIANTS.has(parsed?.darkThemeVariant)
        ? parsed.darkThemeVariant
        : DEFAULT_SETTINGS.darkThemeVariant,
      accentColor: VALID_ACCENTS.has(parsed?.accentColor) ? parsed.accentColor : DEFAULT_SETTINGS.accentColor,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persistSettings() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function getSystemPrefersDark() {
  if (!mediaQuery && typeof window !== "undefined") {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  }

  return mediaQuery?.matches ?? false;
}

function getEffectiveThemeMode() {
  return settings.themeMode === "system"
    ? getSystemPrefersDark()
      ? "dark"
      : "light"
    : settings.themeMode;
}

function applyThemeClasses() {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const effectiveMode = getEffectiveThemeMode();

  root.classList.toggle("dark", effectiveMode === "dark");
  root.classList.toggle(
    "theme-midnight",
    effectiveMode === "dark" && settings.darkThemeVariant === "midnight",
  );

  for (const accent of VALID_ACCENTS) {
    root.classList.remove(`accent-${accent}`);
  }

  root.classList.add(`accent-${settings.accentColor}`);
}

function handleSystemThemeChange() {
  if (settings.themeMode === "system") {
    applyThemeClasses();
  }
}

function attachSystemThemeListener() {
  if (!mediaQuery) {
    getSystemPrefersDark();
  }

  if (!mediaQuery) {
    return;
  }

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return;
  }

  mediaQuery.addListener(handleSystemThemeChange);
}

export function initializeThemeSettings() {
  if (initialized) {
    applyThemeClasses();
    return;
  }

  Object.assign(settings, readStoredSettings());
  attachSystemThemeListener();
  applyThemeClasses();
  initialized = true;
}

function updateThemeMode(themeMode) {
  if (!VALID_THEME_MODES.has(themeMode)) {
    return;
  }

  settings.themeMode = themeMode;
  persistSettings();
  applyThemeClasses();
}

function updateDarkThemeVariant(darkThemeVariant) {
  if (!VALID_DARK_VARIANTS.has(darkThemeVariant)) {
    return;
  }

  settings.darkThemeVariant = darkThemeVariant;
  persistSettings();
  applyThemeClasses();
}

function updateAccentColor(accentColor) {
  if (!VALID_ACCENTS.has(accentColor)) {
    return;
  }

  settings.accentColor = accentColor;
  persistSettings();
  applyThemeClasses();
}

export function useThemeSettings() {
  initializeThemeSettings();

  return {
    settings,
    effectiveThemeMode: computed(() => getEffectiveThemeMode()),
    updateThemeMode,
    updateDarkThemeVariant,
    updateAccentColor,
  };
}
