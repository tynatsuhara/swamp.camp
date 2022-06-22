const path = require("path")

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
