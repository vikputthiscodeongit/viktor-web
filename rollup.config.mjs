import { babel } from "@rollup/plugin-babel";

export default {
    input: "index.ts",
    output: {
        file: "dist/bundle.js",
        format: "es",
    },
    plugins: [
        babel({
            exclude: "node_modules/**",
            babelHelpers: "bundled",
            extensions: [[".ts", ".tsx", ".js", ".jsx", ".es6", ".es", ".mjs"]],
        }),
    ],
};
