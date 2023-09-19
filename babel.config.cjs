module.exports = (api) => {
    api.cache(true);

    const configBase = {
        sourceType: "module",
        sourceMaps: "inline",
        presets: [["@babel/preset-env"]],
    };
    const configProd = {
        sourceMaps: false,
        presets: [...configBase.presets, ["minify", { removeConsole: true }]],
        plugins: ["transform-remove-console"],
    };

    // eslint-disable-next-line no-undef
    return process.env.NODE_ENV === "production" ? configProd : configBase;
};
