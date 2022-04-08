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
        "url(https://fonts.gstatic.com/l/font?kit=e3t4euO8T-267oIAQAu6jDQyK0nXgPRE4rWoBrU8zk58VDOks2wfaGBt3jvARHQcUjfUQlapyTOIDwisBxCS_Zd0xsD9mIZYb1tPZk2A3HROJNZNzLR9wtR9EVHXnVspl-6RIkwvJ_s3MWoB8LxL9JhapdYRCjmPjczWE-9YtPT1acz85miar2ZBC8tfqcw-tsaThZS0xXDNw2zo9fY0ZgJycybMEEx7qYEfz0rWH4hiv1HEe6Lex3p7dnKW4VhSG9_Rnvip9iWoLZIId3-Wy1fI1ERBdWPRGUHXDmEaY3xtzyr4yu7U6qX1OqbPVmJKPfmgB-CWF7aMO9yL8S1JlPgi69EQTgrVUKP5VG-vpgAbX1PudUlHQHpiM9dfHvKfIfzP2WqL5ZLvP4iNShfeF15g4_GWSuubnxy0oYLW00-J55DNjaCdehEkBiE3SAR-BcK3hw-Kf6KYOs5SySX6XJ3bKfuu-Q0FOyKgLUCHa6qsZYwyMaYW73RlJxowNBRPs2Tkc91v6cUz9JHfBE0LwVmBcCy81GHXq3AVJvGC6A_tXlZLCiiVVCFA75-JGlzte4mX82eHGhHO&skey=24cc298767068e24&v=v12)"
    ),
]).then(() => {
    // start the engine (vroom vroom)
    Engine.start(new SwampCampGame(), <HTMLCanvasElement>document.getElementById("canvas"))
})
