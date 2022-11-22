const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    context: path.resolve(__dirname),

    entry: {
        main: "./index.js"
    },

    output: {
        assetModuleFilename: "[path][name]_[contenthash][ext]",
        clean: true,
        chunkFilename: "bundle-[name]-[id].js",
        filename: "bundle-[name].js"
    },

    mode: "production",

    devtool: "source-map",

    plugins: [
        new MiniCssExtractPlugin({
            filename: "./style.css"
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
    },

    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true
                    }
                },
            }),
        ],
    }
};
