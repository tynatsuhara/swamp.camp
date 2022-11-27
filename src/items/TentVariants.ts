import { ImageFilters } from "../graphics/ImageFilters"
import { Color } from "../ui/Color"

const VARIANTS = {
    red: { dark: Color.PINK_2, light: Color.PINK_3, accent: Color.PINK_4 },
    blue: { dark: Color.BLUE_3, light: Color.BLUE_4, accent: Color.BLUE_5 },
    taupe: { dark: Color.TAUPE_3, light: Color.TAUPE_4, accent: Color.TAUPE_5 },
}

export type TentColor = keyof typeof VARIANTS
export type TentData = { color: TentColor; destinationUUID: string }

export const getTentVariantImageFilter = (color: TentColor) => {
    const schema = VARIANTS[color]
    return ImageFilters.recolor(
        [Color.PINK_2, schema.dark],
        [Color.PINK_3, schema.light],
        [Color.PINK_4, schema.accent]
    )
}
