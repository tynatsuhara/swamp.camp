import { Color } from "../ui/Color"
import { Point } from "../../engine/point"

export const ImageFilters = {
    /**
     * any oldColor pixels will be set to newColor
     */
    recolor: (oldColor: string, newColor: string) => {
        const rgbOld = Color.getRGB(oldColor)
        const rgbNew = Color.getRGB(newColor)
        return (img: ImageData) => {
            const d = img.data
            for (let i = 0; i < img.data.length; i+=4) {
                if (d[i] === rgbOld[0] && d[i+1] === rgbOld[1] && d[i+2] === rgbOld[2]) {
                    img.data[i] = rgbNew[0]
                    img.data[i+1] = rgbNew[1]
                    img.data[i+2] = rgbNew[2]
                }
            }
        }
    },

    /**
     * recolors all opaque pixels the given color
     */
    tint: (color: string) => {
        const rgb = Color.getRGB(color)
        return (img: ImageData) => {
            for (let i = 0; i < img.data.length; i+=4) {
                if (img.data[i+3] !== 0) {
                    img.data[i] = rgb[0]
                    img.data[i+1] = rgb[1]
                    img.data[i+2] = rgb[2]
                }
            }
        }
    },

    /**
     * makes pixels invisible based on the given probability function
     */
    dissolve: (dissolveProbabilityFn: (pt: Point) => number) => {
        return (img: ImageData) => {
            for (let x = 0; x < img.width; x++) {
                for (let y = 0; y < img.height; y++) {
                    if (Math.random() < dissolveProbabilityFn(new Point(x, y))) {
                        const i = (x + y * img.width) * 4
                        img.data[i+3] = 0
                    }
                }
            }
        }
    },
}
