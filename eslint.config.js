import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

export default defineConfig([
  { ignores: ["dist/**"] },
  { files: ["**/*.{js,mjs,cjs,vue}"] },
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  pluginVue.configs["flat/essential"],
  {
    // override for just the Footer.vue component
    files: ["**/Footer.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
]);
