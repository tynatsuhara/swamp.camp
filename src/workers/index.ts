export const createWorker = (filename: "minimap") => {
    return new Worker(`workers/${filename}.js`)
}
