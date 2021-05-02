import { Color, getRGB } from "../ui/Color"
import { Point } from "../../engine/Point"

export const ImageFilters = {
    /**
     * any oldColor pixels will be set to newColor
     */
    recolor: (oldColor: Color, newColor: Color) => {
        const rgbOld = getRGB(oldColor)
        const rgbNew = getRGB(newColor)
        return (img: ImageData) => {
            const result = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
            const d = result.data
            for (let i = 0; i < result.data.length; i+=4) {
                if (d[i] === rgbOld[0] && d[i+1] === rgbOld[1] && d[i+2] === rgbOld[2]) {
                    result.data[i] = rgbNew[0]
                    result.data[i+1] = rgbNew[1]
                    result.data[i+2] = rgbNew[2]
                }
            }
            return result
        }
    },

    /**
     * recolors all opaque pixels the given color
     */
    tint: (color: Color) => {
        const rgb = getRGB(color)
        return (img: ImageData) => {
            const result = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
            for (let i = 0; i < result.data.length; i+=4) {
                if (result.data[i+3] !== 0) {
                    result.data[i] = rgb[0]
                    result.data[i+1] = rgb[1]
                    result.data[i+2] = rgb[2]
                }
            }
            return result
        }
    },

    /**
     * makes pixels invisible based on the given probability function
     */
    dissolve: (dissolveProbabilityFn: (pt: Point) => number) => {
        return (img: ImageData) => {
            const result = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
            for (let x = 0; x < result.width; x++) {
                for (let y = 0; y < result.height; y++) {
                    if (Math.random() < dissolveProbabilityFn(new Point(x, y))) {
                        const i = (x + y * result.width) * 4
                        result.data[i+3] = 0
                    }
                }
            }
            return result
        }
    },

    /**
     * reduces the size of the image by factor (eg shrink(2) halves the image size)
     */
    shrink: (factor: number) => {
        return (img: ImageData) => {
            const result = new ImageData(Math.floor(img.width/factor), Math.floor(img.height/factor))
            for (let x = 0; x < result.width; x++) {
                for (let y = 0; y < result.height; y++) {
                    const i = (x + y * result.width) * 4
                    const srcI = (x + y * img.width) * 4 * factor
                    result.data[i] = img.data[srcI]
                    result.data[i+1] = img.data[srcI+1]
                    result.data[i+2] = img.data[srcI+2]
                    result.data[i+3] = img.data[srcI+3]
                }
            }
            return result
        }
    }
}
