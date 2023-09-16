import autoprefixer from "autoprefixer";
import cssnanoPlugin from "cssnano";

const config = () => {
    const configBase = {
        plugins: [autoprefixer],
    };
    const configProd = {
        plugins: [...configBase.plugins, cssnanoPlugin({ preset: "default" })],
    };

    return process.env.NODE_ENV === "production" ? configProd : configBase;
};

export default config;
