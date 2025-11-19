import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist", "*.config.js"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { args: "none", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // React-specific rules
      "react/prop-types": "off",
      "react/require-default-props": "off",
      "react/jsx-no-bind": [
        "warn",
        {
          allowArrowFunctions: false,
          allowBind: false,
          ignoreRefs: true,
        },
      ],
      "react/no-array-index-key": "warn",
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
      "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }],
      "react/jsx-curly-brace-presence": [
        "warn",
        {
          props: "never",
          children: "never",
        },
      ],
      "react/self-closing-comp": "warn",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/button-has-type": "warn",
      "react/iframe-missing-sandbox": "warn",

      complexity: ["warn", { max: 10 }],
      "max-depth": ["warn", 4],
      "max-lines-per-function": [
        "warn",
        {
          max: 100,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-nested-callbacks": ["warn", 3],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "forbid",
        },
        {
          selector: "import",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        // No format enforcement for API compatibility
        {
          selector: "variable",
          modifiers: ["destructured"],
          format: null,
        },
        {
          selector: ["classProperty", "objectLiteralProperty", "typeProperty"],
          format: ["camelCase", "snake_case", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: [
            "classProperty",
            "objectLiteralProperty",
            "typeProperty",
            "classMethod",
            "objectLiteralMethod",
            "typeMethod",
            "accessor",
            "enumMember",
          ],
          format: null,
          modifiers: ["requiresQuotes"],
        },
        {
          selector: "method",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        // Forbid "I" prefix on interfaces
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^I[A-Z]",
            match: false,
          },
        },
        {
          selector: "typeParameter",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["PascalCase", "UPPER_CASE"],
        },
      ],
    },
  },
);
