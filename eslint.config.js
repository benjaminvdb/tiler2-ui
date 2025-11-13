import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
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
      // Code complexity rules
      "complexity": ["warn", { "max": 10 }],
      "max-depth": ["warn", 4],
      "max-lines-per-function": [
        "warn",
        {
          "max": 100,
          "skipBlankLines": true,
          "skipComments": true,
        },
      ],
      "max-nested-callbacks": ["warn", 3],
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
