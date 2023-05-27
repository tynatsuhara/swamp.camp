import { Point } from "brigsby/dist"
import { ImageFilter } from "brigsby/dist/sprites"
import { Color, getRGB } from "../ui/Color"
import { SeededRandom } from "../utils/SeededRandom"

export const ImageFilters = {
    /**
     * @param filters Multiple filters which will be applied in order.
     * @returns undefined if there are no truthy filters!
     */
    composite: (...filters: ImageFilter[]): ImageFilter => {
        filters = filters.filter((f) => !!f)
        if (filters.length === 0) {
            return undefined
        }
        return (img: ImageData) => {
            filters.forEach((f) => {
                img = f(img)
            })
            return img
        }
    },

    /**
     * any oldColor pixels will be set to newColor
     */
    recolor: (...colors: [oldColor: Color, newColor: Color][]): ImageFilter => {
        const rgbsOld = colors.map(([oldColor, newColor]) => getRGB(oldColor))
        const rgbsNew = colors.map(([oldColor, newColor]) => getRGB(newColor))
        return (img: ImageData) => {
            const result = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
            const d = result.data
            for (let i = 0; i < result.data.length; i += 4) {
                for (let j = 0; j < rgbsOld.length; j++) {
                    const rgbOld = rgbsOld[j]
                    if (d[i] === rgbOld[0] && d[i + 1] === rgbOld[1] && d[i + 2] === rgbOld[2]) {
                        const rgbNew = rgbsNew[j]
                        result.data[i] = rgbNew[0]
                        result.data[i + 1] = rgbNew[1]
                        result.data[i + 2] = rgbNew[2]
                        break
                    }
                }
            }
            return result
        }
    },

    /**
     * recolors all opaque pixels the given color
     */
    tint: (color: Color): ImageFilter => {
        const rgb = getRGB(color)
        return (img: ImageData) => {
            const result = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
            for (let i = 0; i < result.data.length; i += 4) {
                if (result.data[i + 3] !== 0) {
                    result.data[i] = rgb[0]
                    result.data[i + 1] = rgb[1]
                    result.data[i + 2] = rgb[2]
                }
            }
            return result
        }
    },

    /**
     * recolors all opaque pixels the given color
     */
    overlay: (color: Color, alpha: number): ImageFilter => {
        const overlayRGB = getRGB(color)
        return (img: ImageData) => {
            const result = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
            for (let i = 0; i < result.data.length; i += 4) {
                if (result.data[i + 3] !== 0) {
                    const currentRGB = [result.data[i], result.data[i + 1], result.data[i + 2]]
                    const red = (currentRGB[0] * (255 - alpha) + overlayRGB[0] * alpha) / 255
                    const green = (currentRGB[1] * (255 - alpha) + overlayRGB[1] * alpha) / 255
                    const blue = (currentRGB[2] * (255 - alpha) + overlayRGB[2] * alpha) / 255
                    result.data[i] = red
                    result.data[i + 1] = green
                    result.data[i + 2] = blue
                }
            }
            return result
        }
    },

    /**
     * makes pixels invisible based on the given probability function
     */
    dissolve: (dissolveProbabilityFn: (pt: Point) => number): ImageFilter => {
        return (img: ImageData) => {
            const random = new SeededRandom(`${img.height}-${img.width}`)
            const result = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
            for (let x = 0; x < result.width; x++) {
                for (let y = 0; y < result.height; y++) {
                    if (random.next() < dissolveProbabilityFn(new Point(x, y))) {
                        const i = (x + y * result.width) * 4
                        result.data[i + 3] = 0
                    }
                }
            }
            return result
        }
    },

    /**
     * reduces the size of the image by factor (eg shrink(2) halves the image size)
     */
    shrink: (factor: number): ImageFilter => {
        return (img: ImageData) => {
            const result = new ImageData(
                Math.floor(img.width / factor),
                Math.floor(img.height / factor)
            )
            for (let x = 0; x < result.width; x++) {
                for (let y = 0; y < result.height; y++) {
                    const i = (x + y * result.width) * 4
                    const srcI = (x + y * img.width) * 4 * factor
                    result.data[i] = img.data[srcI]
                    result.data[i + 1] = img.data[srcI + 1]
                    result.data[i + 2] = img.data[srcI + 2]
                    result.data[i + 3] = img.data[srcI + 3]
                }
            }
            return result
        }
    },

    /**
     * filters to only include the pixels for which the include function returns true
     */
    segment: (include: (x: number, y: number) => boolean): ImageFilter => {
        return (img: ImageData) => {
            const result = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
            for (let x = 0; x < result.width; x++) {
                for (let y = 0; y < result.height; y++) {
                    if (include(x, y)) {
                        const i = (x + y * result.width) * 4
                        result.data[i] = img.data[0]
                        result.data[i + 1] = img.data[1]
                        result.data[i + 2] = img.data[2]
                        result.data[i + 3] = img.data[3]
                    }
                }
            }
            return result
        }
    },
}
