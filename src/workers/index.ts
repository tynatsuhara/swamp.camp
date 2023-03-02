export const createWorker = (name: "minimap") => {
    return new Worker(`workers/${name}.js`)
}
