import { Point } from "brigsby/dist/Point"
import { renderer } from "brigsby/dist/renderer/Renderer"
import { ZOOM } from "../core/SwampCampGame"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"

export class TextInput {
    private readonly element: HTMLElement
    private readonly cursorFlashInterval: NodeJS.Timeout
    private value: string = ""

    constructor(prefixText: string, topCenterPos: Point, maxLength: number, onEnter: () => void) {
        const wrapper = document.createElement("div")
        this.element = document.body.appendChild(wrapper)
        this.reposition(topCenterPos)

        const prefix = document.createTextNode(prefixText)
        const input = document.createElement("input")
        const suffix = document.createTextNode("_")

        wrapper.appendChild(prefix)
        wrapper.appendChild(input)
        wrapper.appendChild(suffix)

        input.type = "text"
        input.focus()

        input.style.width = "0"
        input.style.background = "transparent"
        input.style.border = "none"
        input.style.outline = "none"
        input.style.fontFamily = TEXT_FONT
        input.style.maxWidth = "400px"
        input.style.padding = "0"
        input.style.caretColor = "transparent"
        input.style.fontSize = "inherit"

        input.oninput = (e) => {
            input.value = input.value.toUpperCase().substring(0, maxLength)
            this.value = input.value
            // ideally this would update every frame, but users don't change
            // their screen size mid-game ususally so it's probably fine
            input.style.width = `${this.scale * TEXT_PIXEL_WIDTH * input.value.length}px`
        }

        input.onkeydown = (e) => {
            e.stopPropagation()
            if (e.key === "Enter") {
                onEnter()
            }
        }

        input.onblur = () => {
            input.focus()
        }

        this.cursorFlashInterval = setInterval(() => {
            suffix.nodeValue =
                suffix.nodeValue === "_"
                    ? "\u00A0" // nbsp
                    : "_"
        }, 500)
    }

    getValue() {
        return this.value
    }

    reposition(topCenterPos: Point) {
        let { x, y } = topCenterPos
        const elementStyles = this.element.style
        const width = 600
        const scale = this.scale
        const left = x * scale - width / 2
        const top = y * scale - 8 / renderer.getScale()
        elementStyles.position = "fixed"
        elementStyles.width = `${600}px`
        elementStyles.left = `${left}px`
        elementStyles.top = `${top}px`
        elementStyles.textAlign = "center"
        elementStyles.verticalAlign = "text-bottom"
        elementStyles.fontSize = `${TEXT_SIZE * scale}px`
    }

    delete(): undefined {
        clearInterval(this.cursorFlashInterval)
        document.body.removeChild(this.element)
        document.getElementById("canvas").focus()
        return undefined
    }

    private get scale() {
        return ZOOM * renderer.getScale()
    }
}
