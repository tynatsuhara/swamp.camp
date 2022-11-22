import { Lists } from "brigsby/dist/util"

// from https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
export const newUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

// this could be denser — but a lot of utf8 code points cause issues
const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

/**
 * @param bytes defaults to 12, the max length for a sync function
 */
export const randomByteString = (bytes: number = 12) => {
    return Lists.range(0, bytes)
        .map(() => CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length)))
        .join("")
}
