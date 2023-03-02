const path = require("path")
const fs = require("fs")

const workers = fs
    .readdirSync("./src/workers", { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== "index")
    .map(({ name }) => name.replace(".ts", ""))
    .map((name) => [`workers/${name}`, `./src/workers/${name}.ts`])

module.exports = (_, argv) => ({
    entry: {
        app: "./src/app.ts",
        ...Object.fromEntries(workers),
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
