/* eslint-disable no-undef */
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

const config = () => {
    const configBase = {
        plugins: [autoprefixer],
    };
    const configProd = {
        ...configBase,
        plugins: [...configBase.plugins, cssnano({ preset: "default" })],
    };
    const activeConfig = process.env.NODE_ENV === "production" ? configProd : configBase;

    return activeConfig;
};

export default config;
