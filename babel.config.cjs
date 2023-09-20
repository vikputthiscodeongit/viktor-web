/* eslint-disable no-undef */
const config = (api) => {
    api.cache.invalidate(() => process.env.NODE_ENV);

    const configBase = {
        sourceType: "module",
        sourceMaps: "inline",
        presets: [
            "@babel/preset-typescript",
            [
                "@babel/preset-env",
                {
                    useBuiltIns: "usage",
                    corejs: { version: "3.22", proposals: true },
                },
            ],
        ],
    };
    const configProd = {
        sourceMaps: false,
        presets: [...configBase.presets, ["minify", { removeConsole: true }]],
        ...configBase,
        plugins: ["transform-remove-console"],
    };
    const activeConfig = api.env("production") ? configProd : configBase;

    return activeConfig;
};

module.exports = config;
