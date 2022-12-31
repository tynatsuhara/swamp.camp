const path = require("path")

module.exports = (_, argv) => ({
    entry: {
        app: "./src/app.ts",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
        symlinks: false,
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "static"),
    },
    devtool: argv.mode === "development" ? "eval-cheap-module-source-map" : "nosources-source-map",
    devServer: {
        compress: true,
        hot: false,
        liveReload: false,
        open: false,
        port: 8000,
        static: {
            directory: path.join(__dirname, "static"),
        },
    },
    stats: {
        assets: false,
        modules: false,
    },
})
