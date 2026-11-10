import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "*.html"],
  },
  js.configs.recommended,
];
