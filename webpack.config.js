/* eslint-disable no-undef */
import path from "path";
import { fileURLToPath } from "url";
import { merge } from "webpack-merge";
import ESLintPlugin from "eslint-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

// https://stackoverflow.com/a/64383997/6396604
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configBase = {
    context: path.resolve(__dirname),
    entry: {
        main: "./index.ts",
    },
    output: {
        assetModuleFilename: "[path][name]_[contenthash][ext]",
        clean: true,
        chunkFilename: "bundle-[name]-[id].js",
        filename: "bundle-[name].js",
    },
    stats: {
        children: true,
    },
    resolve: {
        extensions: [".ts", ".js"],
        extensionAlias: {
            ".ts": [".ts", ".tsx"],
        },
    },
    plugins: [
        new ESLintPlugin({}),
        new MiniCssExtractPlugin({
            filename: "./style.css",
        }),
    ],
    module: {
        rules: [
            {
                test: /\.([cm]?ts|tsx|[cm]?js)$/,
                exclude: /node_modules/,
                use: { loader: "babel-loader" },
            },
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" },
                    { loader: "postcss-loader" },
                ],
            },
        ],
    },
};

const configDev = {
    mode: "development",
    devtool: "eval-source-map",
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                indentWidth: 4,
                                outputStyle: "expanded",
                                precision: 6,
                            },
                        },
                    },
                ],
            },
        ],
    },
};

const configProd = {
    mode: "production",
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                precision: 6,
                            },
                        },
                    },
                ],
            },
        ],
    },
};

const configActive = process.env.NODE_ENV === "production" ? configProd : configDev;
const mergedConfig = merge(configBase, configActive);
console.log(mergedConfig);

export default mergedConfig;
