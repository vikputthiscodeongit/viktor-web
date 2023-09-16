module.exports = (env) => {
    const configBase = {
        presets: [["@babel/preset-env"]],
    };
    const configProd = {
        presets: [...configBase.presets, ["minify", { removeConsole: true }]],
        plugins: ["transform-remove-console"],
    };

    return env === "production" ? configProd : configBase;
};
