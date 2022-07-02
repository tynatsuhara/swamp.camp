import { assets, Point } from "brigsby/dist"

export type Teleporter = {
    to: string // destination uuid
    pos: Point // point representing where a dude will be STANDING after traveling to this teleporter
    id: string // to distinguish multiple teleporters between the same destinations. prefixes can be used to trigger sound effects
    toId?: string // use this if the ID doesn't match on the other side (EG same-location teleporters)
}

export const TeleporterPrefix = {
    TENT: "tent",
    DOOR: "door",
    MINE: "mine",
}

export class TeleporterSound {
    static readonly TENT: [string, number] = ["audio/rpg/world/tent.wav", 0.05]
    static readonly DOOR: [string, number] = ["audio/rpg/world/door.wav", 0.05]
}

export const Teleporters = {
    teleporterId: (toUUID: string, id: string = null) => {
        return `${toUUID}${!!id ? `$${id}` : ""}`
    },

    getId: (teleporterId: string) => {
        const dollarIndex = teleporterId.indexOf("$")
        return dollarIndex === -1
            ? undefined
            : teleporterId.substring(teleporterId.indexOf("$") + 1)
    },
}

assets.loadAudioFiles([TeleporterSound.TENT, TeleporterSound.DOOR].map((ts) => ts[0]))
