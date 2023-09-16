const config = (api) => {
    api.cache.invalidate(() => process.env.NODE_ENV);

    const configBase = {
        presets: [["@babel/preset-env"]],
    };
    const configProd = {
        presets: [...configBase.presets, ["minify", { removeConsole: true }]],
        plugins: ["transform-remove-console"],
    };

    return process.env.NODE_ENV === "production" ? configProd : configBase;
};

export default config;
