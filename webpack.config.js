const path = require("path")
const fs = require("fs")
const CircularDependencyPlugin = require("circular-dependency-plugin")

const workers = fs
    .readdirSync("./src/workers", { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== "index.ts")
    .map(({ name }) => name.replace(".ts", ""))
    .map((name) => [`workers/${name}`, `./src/workers/${name}.ts`])

module.exports = (_, argv) => {
    const plugins = []

    const native = process.env.IS_NATIVE === "true"

    if (process.env.CYCLE_CHECK) {
        plugins.push(
            new CircularDependencyPlugin({
                // exclude detection of files based on a RegExp
                exclude: /node_modules/,
                // include specific files based on a RegExp
                include: /src/,
                // add errors to webpack instead of warnings
                failOnError: false,
            })
        )
    }

    return {
        entry: {
            app: `./src/${native ? "native" : "web"}.ts`,
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
        devtool:
            argv.mode === "development" ? "eval-cheap-module-source-map" : "nosources-source-map",
        devServer: {
            allowedHosts: "all",
            https: false,
            compress: true,
            hot: false,
            liveReload: false,
            open: false,
            port: 8000,
            client: {
                webSocketURL: "auto://0.0.0.0:0/ws",
            },
            static: {
                directory: path.join(__dirname, "static"),
            },
        },
        stats: {
            assets: false,
            modules: false,
        },
        plugins,
    }
}
