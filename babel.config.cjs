/* eslint-disable no-undef */
const config = (api) => {
    api.cache.invalidate(() => process.env.NODE_ENV);

    const configBase = {
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
        ...configBase,
        presets: [...configBase.presets, ["minify", { builtIns: false, removeConsole: true }]],
        plugins: ["transform-remove-console"],
    };
    const activeConfig = api.env("production") ? configProd : configBase;

    return activeConfig;
};

module.exports = config;
