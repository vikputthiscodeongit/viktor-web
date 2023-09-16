module.exports = (env) => {
    const configBase = {
        plugins: [require("autoprefixer")()],
    };
    const configProd = {
        plugins: [...configBase.plugins, require("cssnano")({ preset: "default" })],
    };

    return env === "production" ? configProd : configBase;
};
