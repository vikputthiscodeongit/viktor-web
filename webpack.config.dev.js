import path from "path";
import { fileURLToPath } from "url";
import ESLintPlugin from "eslint-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

// https://stackoverflow.com/a/64383997/6396604
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
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

    mode: "development",

    devtool: "eval",

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
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-typescript",
                            [
                                "@babel/preset-env",
                                {
                                    useBuiltIns: "usage",
                                    corejs: { version: "3.22", proposals: true },
                                },
                            ],
                        ],
                    },
                },
            },
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" },
                    { loader: "postcss-loader" },
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

export default config;
