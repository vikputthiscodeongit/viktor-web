/* eslint-disable no-undef */
const config = {
    env: {
        browser: true,
        es2022: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    parser: "@babel/eslint-parser",
    parserOptions: {
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "prettier"],
};

module.exports = config;
