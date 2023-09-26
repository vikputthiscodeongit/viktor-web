/* eslint-disable no-undef */
const config = (api) => {
    api.cache.invalidate(() => process.env.NODE_ENV);

    const baseConfig = {
        sourceMaps: true,
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
    const prodConfig = {
        ...baseConfig,
        presets: [...baseConfig.presets, ["minify", { builtIns: false, removeConsole: true }]],
        plugins: ["transform-remove-console"],
    };
    const activeConfig = api.env("production") ? prodConfig : baseConfig;

    return activeConfig;
};

module.exports = config;
