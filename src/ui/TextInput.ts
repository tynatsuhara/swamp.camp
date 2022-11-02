import { Point } from "brigsby/dist/Point"
import { ZOOM } from "../SwampCampGame"
import { TEXT_FONT, TEXT_PIXEL_WIDTH } from "./Text"

export class TextInput {
    private readonly element: HTMLElement
    private readonly cursorFlashInterval: NodeJS.Timer
    private value: string = ""

    constructor(topCenterPos: Point, maxLength: number) {
        const wrapper = document.createElement("div")
        this.element = document.body.appendChild(wrapper)
        this.reposition(topCenterPos)

        const prefix = document.createTextNode("SESSION @")
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

        input.oninput = (e) => {
            input.value = input.value.toUpperCase().substring(0, maxLength)
            this.value = input.value
            input.style.width = `${ZOOM * TEXT_PIXEL_WIDTH * input.value.length}px`
        }

        input.onkeydown = (e) => {
            e.stopPropagation()
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
        const elementStyles = this.element.style
        const width = 600
        elementStyles.position = "fixed"
        elementStyles.width = `${600}px`
        elementStyles.left = `${topCenterPos.x * ZOOM - width / 2}px`
        elementStyles.top = `${Math.floor(topCenterPos.y * ZOOM) - 4}px`
        elementStyles.textAlign = "center"
    }

    delete(): undefined {
        clearInterval(this.cursorFlashInterval)
        document.body.removeChild(this.element)
        // TODO: return focus to the document
        return undefined
    }
}
