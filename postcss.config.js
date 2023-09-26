/* eslint-disable no-undef */
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

const config = () => {
    const baseConfig = {
        plugins: [autoprefixer],
    };
    const prodConfig = {
        ...baseConfig,
        plugins: [...baseConfig.plugins, cssnano({ preset: "default" })],
    };
    const activeConfig = process.env.NODE_ENV === "production" ? prodConfig : baseConfig;

    return activeConfig;
};

export default config;
