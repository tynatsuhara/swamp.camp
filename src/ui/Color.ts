export enum Color {
    // nanner colors
    // TODO rename
    BLACK = "#2d1e2f",
    WHITE = "#fcecd1",
    DARK_ORANGE = "#7a3b4f",
    ORANGE = "#a94b54",
    SUPER_ORANGE = "#d8725e",
    LIGHT_ORANGE = "#f09f71",
    GREEN = "#64b082",
    DARK_BROWN = "#452e3f",
    BROWN = "#5d4550",
    LIGHT_BROWN = "#7b6268",

    // TODO below this comment

    // only used for plumes
    DARK_DARK_PINK = "#5f2d56",
    DARK_PINK = "#993970",
    DARK_PURPLE = "#473579",
    DARK_PINKLE = "#8156aa",
    PINKLE = "#c278d0",
    LIGHT_PINKLE = "#f0b3dd",

    PINK = "#dc4a7b",
    LIGHT_PINK = "#f78697",
    RED = "#9f294e",
    DARK_RED = "#62232f",
    FLESH = "#fccba3",
    YELLOW = "#facb3e",
    LIME = "#97da3f",
    DARK_GREEN = "#3d734f",
    DARK_DARK_BLUE = "#314152",
    DARK_BLUE = "#417089",
    TEAL = "#49a790",
    BRIGHT_BLUE = "#72d6ce",
    LIGHT_BLUE = "#5698cc",
    PURPLE = "#5956bd",
    TAN = "#d3bfa9",
}

const toHex = (c: number) => {
    var hex = c.toString(16)
    return hex.length == 1 ? "0" + hex : hex
}

export const getHex = (r: number, g: number, b: number): String => {
    return "#" + toHex(r) + toHex(g) + toHex(b)
}

export const getRGB = (color: Color): number[] => {
    const noHash = color.replace("#", "")
    const r = parseInt(noHash.substring(0, 2), 16)
    const g = parseInt(noHash.substring(2, 4), 16)
    const b = parseInt(noHash.substring(4, 6), 16)
    return [r, g, b]
}

export const getHSL = (color: Color) => {
    // https://css-tricks.com/converting-color-spaces-in-javascript/

    const rgb = getRGB(color)
    // Make r, g, and b fractions of 1
    const r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255

    // Find greatest and smallest channel values
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0

    // Calculate hue
    if (delta == 0) h = 0
    // Red is max
    else if (cmax == r) h = ((g - b) / delta) % 6
    // Green is max
    else if (cmax == g) h = (b - r) / delta + 2
    // Blue is max
    else h = (r - g) / delta + 4

    h = Math.round(h * 60)

    // Make negative hues positive behind 360°
    if (h < 0) h += 360

    // Calculate lightness
    l = (cmax + cmin) / 2

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

    // Multiply l and s by 100
    s = +(s * 100).toFixed(1)
    l = +(l * 100).toFixed(1)

    return [h, s, l]
}
