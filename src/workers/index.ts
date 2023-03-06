export const createWorker = <Request, Response>(
    filename: "minimap" | "newlocation"
): [(data: Request) => void, (callback: (response: Response) => void) => void] => {
    const worker = new Worker(`workers/${filename}.js?v=${window.SWAMP_CAMP.version}`)
    const sender = (data: Request) => {
        worker.postMessage(data)
    }
    const receiver = (callback: (response: Response) => void) => {
        worker.onmessage = (responseMessage) => callback(responseMessage.data)
    }
    return [sender, receiver]
}
