/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint:recommended"],
  plugins: {
    "only-warn": require("eslint-plugin-only-warn"),
    turbo: require("eslint-plugin-turbo"),
  },
  rules: {
    "turbo/no-undeclared-env-vars": "warn",
  },
  ignorePatterns: ["dist/**"],
};
