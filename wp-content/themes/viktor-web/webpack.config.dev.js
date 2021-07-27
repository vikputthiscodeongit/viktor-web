const path = require("path");
const webpack = require("webpack");

const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    context: path.resolve(__dirname, "./src"),

    entry: {
        main: "./js/index.js"
    },

    output: {
        assetModuleFilename: "[path][name]_[contenthash][ext]",
        clean: true,
        chunkFilename: "./js/bundle-[name]-[id].js",
        filename: "./js/bundle-[name].js"
    },

    mode: "development",

    devtool: "eval",

    plugins: [
        new MiniCssExtractPlugin({
            filename: "./css/style.css"
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "favicon",
                    to: "favicon",
                    noErrorOnMissing: true
                },
                {
                    from: "images",
                    to: "images",
                    globOptions: {
                        ignore: ["**/compiled/**/*"]
                    },
                    noErrorOnMissing: true
                }
            ]
        })
    ],

    module: {
        rules: [
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
                                precision: 6
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(gif|jpe?g|png|svg)$/i,
                type: "asset/resource"
            },
            {
                test: /\.(eot|otf|ttf|woff|woff2)$/i,
                type: "asset/resource"
            }
        ]
    }
};
