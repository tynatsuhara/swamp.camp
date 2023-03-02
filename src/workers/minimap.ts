import { Lists } from "brigsby/dist/util/Lists"
import { Color, getHex } from "../ui/Color"

export type DrawMiniMap = {
    imageData: ImageData
    width: number
    height: number
    scale: number
}

export type MiniMapDrawn = {
    imageData: ImageData
}

onmessage = (message: MessageEvent<DrawMiniMap>) => {
    const { imageData, width, height, scale } = message.data

    const smallCanvas = new OffscreenCanvas(width / scale, height / scale)
    const smallContext = smallCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D

    const getPixel = (x: number, y: number) => {
        const index = (y * width + x) * 4
        return [
            imageData.data[index + 0],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3],
        ]
    }

    // pixels shaved off for each row offset from the top/bottom
    const cornerShape = [4, 2, 1, 1]

    for (let y = 0; y < smallCanvas.height; y++) {
        for (let x = 0; x < smallCanvas.width; x++) {
            // round the corners
            if (y < cornerShape.length) {
                const rowBlankCount = cornerShape[y]
                if (x < rowBlankCount || x >= smallCanvas.width - rowBlankCount) {
                    continue
                }
            } else if (y >= smallCanvas.height - cornerShape.length) {
                const rowBlankCount = cornerShape[smallCanvas.height - y - 1]
                if (x < rowBlankCount || x >= smallCanvas.width - rowBlankCount) {
                    continue
                }
            }

            const bigX = x * scale
            const bigY = y * scale

            const hexStrings = []
            for (let i = 0; i < scale; i++) {
                for (let j = 0; j < scale; j++) {
                    const [r, g, b] = getPixel(i + bigX, j + bigY)
                    const hex = getHex(r, g, b)
                    hexStrings.push(hex)
                    // weigh other colors higher than grass color to show non-nature things on the map
                    if (hex !== Color.GREEN_5 && hex !== Color.GREEN_6) {
                        hexStrings.push(hex)
                        hexStrings.push(hex)
                    }
                }
            }

            const newColor = Lists.mode(hexStrings)
            smallContext.fillStyle = newColor
            smallContext.fillRect(x, y, 1, 1)
        }
    }

    const response: MiniMapDrawn = {
        imageData: smallContext.getImageData(0, 0, smallCanvas.width, smallCanvas.height),
    }
    postMessage(response)
}
