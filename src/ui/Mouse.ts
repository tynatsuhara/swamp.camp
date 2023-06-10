import { renderer } from "brigsby/dist/renderer/Renderer"
import { ZOOM } from "../core/SwampCampGame"

export const Mouse = {
    lock: () => {
        document.body.requestPointerLock()
    },

    unlock: () => {
        // Ask the browser to release the pointer
        document.exitPointerLock()
    },

    hide: () => {
        document.body.style.cursor = "none"
    },

    show: () => {
        const scale = ZOOM * renderer.getScale()
        // converted from png with https://codepen.io/shshaw/pen/XbxvNj
        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${9 * scale}" height="${
            12 * scale
        }" viewBox="0 -0.5 9 12" shape-rendering="crispEdges">
<path stroke="#d3bfa9" d="M0 0h2M0 1h1M2 1h1M0 2h1M3 2h1M0 3h1M4 3h1M0 4h1M5 4h1M0 5h1M6 5h1M0 6h1M7 6h1M0 7h1M8 7h1M0 8h1M4 8h5M0 9h1M3 9h1M0 10h1M2 10h1M0 11h2" />
<path stroke="#5f2d56" d="M1 1h1M1 2h2M1 3h3M1 4h4M1 5h5M1 6h6M1 7h7M1 8h3M1 9h2M1 10h1" />
</svg>`
        document.body.style.cursor = `url(data:image/svg+xml;utf-8,${encodeURIComponent(
            svg
        )}), default`
    },
}
