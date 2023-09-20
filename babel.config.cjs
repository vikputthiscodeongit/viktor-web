/* eslint-disable no-undef */
const config = (api) => {
    api.cache(true);

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
        plugins: ["transform-remove-console"],
    };

    return process.env.NODE_ENV === "production" ? configProd : configBase;
};

module.exports = config;
