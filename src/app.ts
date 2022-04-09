import { assets } from "brigsby/dist/Assets"
import { Engine } from "brigsby/dist/Engine"
import { getFilesToLoadForMainMenu } from "./graphics/Tilesets"
import { SwampCampGame } from "./SwampCampGame"
import { TEXT_FONT } from "./ui/Text"

Promise.all([
    // load all required assets
    assets.loadImageFiles(getFilesToLoadForMainMenu()),
    assets.loadFont(
        TEXT_FONT,
        "url(https://fonts.gstatic.com/l/font?kit=e3t4euO8T-267oIAQAu6jDQyK0nXgPRE4rWqBrU8z0l9Vz2qsW4ZbmJvwCXCRnIaUDXaTFSrzzWKDXbSBRKU-5V2yM7_moBebVlReE-C2nJMJthDzrZ7xOlCE1fRn1knmeyTJEotJeUpM2gH9r5J-pZYp9Go1TmOjcrWH-9ftc31ScvN5mmapGZAC9ZfqM0PtseTmZS3zl_NwGzp9fE0ZwJxcyfMH0x6qYIfzkrRH4livFHFe53exnp5dnWW4FhRG97Rkfio9j2oLpIJd3iWylfL1EVBemPQGULXD2EdY31tzCr5y9HU66X3OqHPV2JJPfigCOCXCL6MONyN8SxJl_gj694QTwrWUKL5UW-uph8bXlPtdUhHR3pjM9RfH_KQIf3P2mqK5ZXvPoiOShbeKF5h4_KWS-ucnx20ooLX00CJ5pDOjaGdfRElBiI3SQRhBcO3hA-Lf6WYO85RyST6U53aKfiu-A0COyOgLkCGapWsZIwxMacW6HRkJxkwNRRAs2XkcN1u6cIz9ZHcBEwL31mCcCq81WHUq3EVKfGD6AztX1ZOCimWWyFB347zeESWGZDpkXv4eA6AKNY&skey=24cc298767068e24&v=v12)"
    ),
]).then(() => {
    // start the engine (vroom vroom)
    Engine.start(new SwampCampGame(), <HTMLCanvasElement>document.getElementById("canvas"))
})
