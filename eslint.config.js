import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Ignore dist directory
  {
    ignores: ["dist/**"],
  },

  // Base configuration for all JS/TS files
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },

  // TypeScript configuration for all files
  ...tseslint.configs.recommended,

  // Browser environment configuration for src/ directory
  {
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },

  // React configuration for src/ directory
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        pragma: "h",
        pragmaFrag: "Fragment",
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": "off",
    },
  },

  // Node.js environment configuration for cli/ and scripts/ directories
  {
    files: [
      "cli/**/*.{js,mjs,cjs,ts,mts,cts}",
      "scripts/**/*.{js,mjs,cjs,ts,mts,cts}",
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // JSON configuration
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },

  // CSS configuration
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
]);
