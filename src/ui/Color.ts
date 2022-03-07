export enum Color {
    // nanner pancakes colors

    // each color band starts with black and ends with white
    BLACK = "#2d1e2f",
    WHITE = "#fcecd1",

    // dull browns
    TAUPE_1 = "#452e3f",
    TAUPE_2 = "#5d4550",
    TAUPE_3 = "#7b6268",
    TAUPE_4 = "#9c807e",
    TAUPE_5 = "#c3a79c",
    TAUPE_6 = "#dbc9b4",

    // purples, blues
    BLUE_1 = "#392945",
    BLUE_2 = "#3e3b66",
    BLUE_3 = "#4a5786",
    BLUE_4 = "#577f9d",
    BLUE_5 = "#6fb0b7",
    BLUE_6 = "#a0ddd3",

    // teals, greens
    GREEN_1 = "#392945",
    GREEN_2 = "#3e3b66",
    GREEN_3 = "#3f5b74",
    GREEN_4 = "#488885",
    GREEN_5 = "#64b082",
    GREEN_6 = "#aad795",

    // purples, pinks, flesh tones
    PINK_1 = "#4e2b45",
    PINK_2 = "#7c3d64",
    PINK_3 = "#ab597d",
    PINK_4 = "#c57f79",
    PINK_5 = "#d3a084",
    PINK_6 = "#ebc8a7",

    // reddish-browns, flesh tones
    BROWN_1 = "#4e2b45",
    BROWN_2 = "#6a3948",
    BROWN_3 = "#8f5252",
    BROWN_4 = "#b87e6c",
    BROWN_5 = "#d3a084",
    BROWN_6 = "#ebc8a7",

    // reds, oranges, yellow
    RED_1 = "#4e2b45",
    RED_2 = "#7a3b4f",
    RED_3 = "#a94b54",
    RED_4 = "#d8725e",
    RED_5 = "#f09f71",
    RED_6 = "#f7cf91",

    // TODO below this comment

    // used for other shit
    RED = "#9f294e",
    PINK = "#dc4a7b",
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
