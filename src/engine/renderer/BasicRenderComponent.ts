import { Component } from "../component"
import { RenderMethod } from "./RenderMethod"

export class BasicRenderComponent extends Component {

    private readonly render: RenderMethod

    constructor(render: RenderMethod) {
        super()
        this.render = render
    }

    getRenderMethods(): RenderMethod[] {
        return [this.render]
    }
}