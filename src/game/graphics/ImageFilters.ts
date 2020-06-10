import { Color } from "../ui/Color"

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
    }
}