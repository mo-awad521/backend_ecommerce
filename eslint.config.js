// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["node_modules", "dist"], // ⛔ مجلدات التجاهل
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {},
    rules: {
      ...js.configs.recommended.rules, // ✅ تضمين القواعد الموصى بها من ESLint
      ...prettier.rules, // ✅ تعطيل القواعد المتعارضة مع Prettier
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "prefer-const": "warn",
      eqeqeq: ["warn", "always"],
      curly: ["error", "all"],
    },
  },
];
