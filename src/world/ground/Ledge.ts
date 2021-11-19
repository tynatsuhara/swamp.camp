import { GroundComponent } from "./GroundComponent"
import { Entity } from "brigsby/dist/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { ConnectingTileLedgeSchema } from "./ConnectingTileLedgeSchema"
import { ConnectingTile } from "./ConnectingTile"

export const makeLedge = (d: MakeGroundFuncData): GroundComponent => {
    const schema = new ConnectingTileLedgeSchema()

    const e = new Entity([new ConnectingTile(schema, d.wl, d.pos)])

    return e.addComponent(new GroundComponent(GroundType.LEDGE))
}
