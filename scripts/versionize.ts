import { execSync } from "child_process"
import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"

const VERSIONIZED_FILE_TYPES = [".png"]
const STATICS_DIR = path.join(__dirname, "../static/")

/**
 * @returns all full file paths in the given directory
 */
const getFiles = (dir: string): string[] =>
    fs.readdirSync(dir).flatMap((subdir) => {
        const file = path.resolve(dir, subdir)
        return fs.statSync(file).isDirectory() ? getFiles(file) : file
    })

const hash = (data: string) => crypto.createHash("md5").update(data, "utf8").digest("hex")

// { [fileName]: fileHash }
const assets = getFiles(STATICS_DIR)
    .filter((fileName) => VERSIONIZED_FILE_TYPES.some((type) => fileName.endsWith(type)))
    .reduce((obj, fileName) => {
        obj[fileName.replace(STATICS_DIR, "")] = hash(fs.readFileSync(fileName).toString())
        return obj
    }, {} as Record<string, string>)

const version = execSync("git rev-parse HEAD").toString().trim()

const data = {
    /**
     * eagerly loaded static files, hashed for cache busting
     */
    assets,
    /**
     * latest git commit hash, for observability
     */
    version,
}

// inject the version map into the window scope via the template
const indexOutput = fs
    .readFileSync(path.join(STATICS_DIR, "index_template.html"), "utf8")
    .replaceAll('"%SWAMP_CAMP_DATA%"', JSON.stringify(data))

fs.writeFileSync(path.join(STATICS_DIR, "index.html"), indexOutput, "utf8")

console.log("🎉 versionizing complete 🎉\n")
