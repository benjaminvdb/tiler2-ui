import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  { ignores: ["dist"] },
  ...compat.extends("next/core-web-vitals"),
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { args: "none", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Naming conventions (temporarily disabled to focus on types)
      // "@typescript-eslint/naming-convention": [
      //   "error",
      //   {
      //     "selector": "variableLike",
      //     "format": ["camelCase", "PascalCase"],
      //     "leadingUnderscore": "allow"
      //   },
      //   {
      //     "selector": "typeLike",
      //     "format": ["PascalCase"]
      //   },
      //   {
      //     "selector": "function",
      //     "format": ["camelCase", "PascalCase"]
      //   },
      //   {
      //     "selector": "property",
      //     "format": ["camelCase", "snake_case"],
      //     "leadingUnderscore": "allow"
      //   },
      //   {
      //     "selector": "method",
      //     "format": ["camelCase"]
      //   }
      // ],
    },
  },
);
