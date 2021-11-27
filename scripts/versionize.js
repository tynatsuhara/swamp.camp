const path = require("path")
const fs = require("fs")
const { promisify } = require("util")
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const crypto = require("crypto")

const FILE_TYPES = [".png"]
const STATICS_DIR = path.join(__dirname, "../static/")

/**
 * @returns all files in the directory as a promise
 */
async function getFiles(dir) {
    const subdirs = await readdir(dir)
    const files = await Promise.all(
        subdirs.map(async (subdir) => {
            const res = path.resolve(dir, subdir)
            return (await stat(res)).isDirectory() ? getFiles(res) : res
        })
    )
    return files.reduce((a, f) => a.concat(f), [])
}

const checksum = (str) => crypto.createHash("md5").update(str, "utf8").digest("hex")

// resolves to a list of [fileName, fileHash] pairs
const hashesPromise = getFiles(STATICS_DIR).then((files) => {
    return Promise.all(
        files
            .filter((fileName) => FILE_TYPES.some((type) => fileName.endsWith(type)))
            .map((fileName) =>
                readFile(fileName).then((data) => [
                    fileName.replace(STATICS_DIR, ""),
                    checksum(data),
                ])
            )
    )
})

Promise.resolve(hashesPromise).then((hashPairs) => {
    const map = {}
    hashPairs.forEach((pair) => (map[pair[0]] = pair[1]))

    readFile(path.join(STATICS_DIR, "index_template.html"), "utf8").then((template) => {
        // inject the version map into the window scope via the template
        const output = template
            .replace('"{SWAMP_CAMP_ASSETS}"', JSON.stringify(map))
            .replace("{BUILD_TIME}", Date.now())
        writeFile(path.join(STATICS_DIR, "index.html"), output, "utf8")
    })
})
