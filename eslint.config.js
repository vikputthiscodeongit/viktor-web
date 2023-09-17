import js from "@eslint/js";
// import parserTsEslint from "@typescript-eslint/parser";
import parserBabel from "@babel/eslint-parser";
import pluginTsEslint from "@typescript-eslint/eslint-plugin";
import pluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

const config = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
            // parser: parserTsEslint,
            parser: parserBabel,
            parserOptions: {
                requireConfigFile: false,
            },
        },
        plugins: {
            "@typescript-eslint": pluginTsEslint,
            prettier: pluginPrettier,
        },
        rules: {
            ...pluginTsEslint.configs["recommended"].rules,
            ...pluginPrettier.configs["recommended"].rules,
        },
    },
];

export default config;
