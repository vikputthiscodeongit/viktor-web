/* eslint-disable no-undef */
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

const config = () => {
    const configBase = {
        plugins: [autoprefixer],
    };
    const configProd = {
        plugins: [...configBase.plugins, cssnano({ preset: "default" })],
    };

    return process.env.NODE_ENV === "production" ? configProd : configBase;
};

export default config;
