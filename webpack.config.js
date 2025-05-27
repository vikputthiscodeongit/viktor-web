import path from "path";
import { fileURLToPath } from "url";
import { merge } from "webpack-merge";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";

// https://stackoverflow.com/a/64383997/6396604
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseConfig = {
    context: path.resolve(__dirname),
    entry: {
        main: "./index.ts",
    },
    output: {
        clean: true,
        filename: "./index.js",
        library: {
            type: "module",
        },
    },
    stats: {
        children: true,
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [
        new ESLintPlugin({ configType: "flat" }),
        new MiniCssExtractPlugin({ filename: "./style.css" }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                use: "source-map-loader",
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
            },
        ],
    },
    experiments: {
        outputModule: true,
    },
};

const devConfig = {
    mode: "development",
    devtool: "eval-source-map",
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
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

const prodConfig = {
    mode: "production",
    devtool: false,
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
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
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: ["debug", "log", "info"],
                        ecma: "ES2022",
                        module: true,
                        passes: 2,
                    },
                },
            }),
            new CssMinimizerPlugin(),
        ],
    },
};

const activeConfig = process.env.NODE_ENV === "production" ? prodConfig : devConfig;
const mergedConfig = merge(baseConfig, activeConfig);

export default mergedConfig;
