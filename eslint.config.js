import js from "@eslint/js";
import parserTsEslint from "@typescript-eslint/parser";
import pluginTsEslint from "@typescript-eslint/eslint-plugin";
import pluginPrettier from "eslint-plugin-prettier";

const config = [
    js.configs.recommended,
    {
        languageOptions: {
            parser: parserTsEslint,
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
