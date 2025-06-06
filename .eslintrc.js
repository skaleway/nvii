// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  ignorePatterns: ["apps/**", "packages/**"],
  extends: ["eslint:recommended"],
  plugins: ["only-warn", "turbo"],
  rules: {
    "turbo/no-undeclared-env-vars": "warn",
  },
  env: {
    node: true,
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: true,
      },
    },
  ],
};
