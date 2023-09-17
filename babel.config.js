const config = (api) => {
    api.cache.forever();

    const configBase = {
        presets: [
            "@babel/preset-typescript",
            [
                "@babel/preset-env",
                {
                    useBuiltIns: "usage",
                    corejs: { version: "3.22", proposals: true }
                }
            ],
        ],
    };
    const configProd = {
        presets: [...configBase.presets, ["minify", { removeConsole: true }]],
        plugins: ["transform-remove-console"],
    };

    return process.env.NODE_ENV === "production" ? configProd : configBase;
};

export default config;
