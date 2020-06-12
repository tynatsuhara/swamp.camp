import { Color } from "../ui/Color"
import { Point } from "../../engine/point"

export const ImageFilters = {
    tint: (color: string) => {
        const rgb = Color.getRGB(color)
        return (img: ImageData) => {
            for (let i = 0; i < img.data.length; i+=4) {
                if (img.data[i+3] !== 0) {
                    img.data[i+0] = rgb[0]
                    img.data[i+1] = rgb[1]
                    img.data[i+2] = rgb[2]
                }
            }
        }
    },

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
