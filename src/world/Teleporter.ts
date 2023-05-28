import { Point, PointValue } from "brigsby/dist"
import { loadAudio } from "../audio/DeferLoadAudio"
import { Sounds } from "../audio/Sounds"

export type TeleporterSound = "tent" | "door" | "mine"

export type TeleporterSide = {
    location: string //  UUID of the location where this teleporter exists
    pos: PointValue // point representing where a dude will be STANDING after traveling to this teleporter
}

export type TeleporterV2 = {
    a?: TeleporterSide
    b?: TeleporterSide
    sound?: TeleporterSound
}

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

export class TeleporterSounds {
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

    playSound: ({ sound }: TeleporterV2) => {
        if (sound === "door") {
            Sounds.play(...TeleporterSounds.DOOR)
        } else if (sound === "tent") {
            Sounds.play(...TeleporterSounds.TENT)
        }
    },
}

loadAudio([TeleporterSounds.TENT, TeleporterSounds.DOOR].map(([path]) => path))
