const config = (api) => {
    api.cache.invalidate(() => process.env.NODE_ENV);

    const baseConfig = {
        sourceMaps: true,
        presets: [
            "@babel/preset-typescript",
            [
                "@babel/preset-env",
                {
                    modules: false,
                    useBuiltIns: "usage",
                    corejs: { version: "3.37" },
                },
            ],
        ],
        parserOpts: { strictMode: true },
    };

    const prodConfig = {
        ...baseConfig,
        presets: [
            ...baseConfig.presets,
            [
                "minify",
                {
                    builtIns: false,
                    removeConsole: true,
                },
            ],
        ],
        plugins: ["transform-remove-console"],
    };

    const activeConfig = api.env("production") ? prodConfig : baseConfig;

    return activeConfig;
};

module.exports = config;
