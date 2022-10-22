export const prettyPrint = (data: any) =>
    JSON.stringify(data, null, " ").replace(/"([^"]+)":/g, "$1:")

export const stringifySorted = (obj: any) => {
    const allKeys = new Set<string>()
    JSON.stringify(obj, (key, value) => (allKeys.add(key), value))
    return JSON.stringify(obj, Array.from(allKeys).sort())
}
