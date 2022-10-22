export const prettyPrint = (data: any) =>
    JSON.stringify(data, null, " ").replace(/"([^"]+)":/g, "$1:")
