// returns the base64 result of sha-256
export const base64hash = async (data: string, maxLen?: number) => {
    const hashBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data))
    const u8 = new Uint8Array(hashBytes)
    let byteString = ""
    for (const byte of u8) {
        byteString += String.fromCharCode(byte)
    }
    // convert bytestring to base64 (or really, base36)
    return btoa(byteString).substring(0, 4).substring(0, maxLen)
}
