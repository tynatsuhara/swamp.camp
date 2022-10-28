const path = require("path")
const process = require("process")

module.exports = {
    entry: "./src/app.ts",
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
        filename: "app.js",
        path: path.resolve(__dirname, "static"),
    },
    devtool:
        process.env.NODE_ENV === "production"
            ? "nosources-source-map"
            : "eval-cheap-module-source-map",
    devServer: {
        compress: true,
        hot: false,
        liveReload: false,
        open: false,
        port: 8000,
        static: {
            directory: path.join(__dirname, "static"),
            staticOptions: {
                setHeaders: function (res, path, stat) {
                    if (path.endsWith(".png")) {
                        res.set("Cache-Control", "public, max-age=604800, immutable")
                    }
                },
            },
        },
    },
    stats: {
        assets: false,
        modules: false,
    },
}
