import { Entity } from "brigsby/dist"
import { ConnectingTile } from "./ConnectingTile"
import { ConnectingTileLedgeSchema } from "./ConnectingTileLedgeSchema"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { GroundComponent } from "./GroundComponent"

export const makeLedge = (d: MakeGroundFuncData): GroundComponent => {
    const schema = new ConnectingTileLedgeSchema()

    const e = new Entity([new ConnectingTile(schema, d.wl, d.pos)])

    return e.addComponent(new GroundComponent(GroundType.LEDGE))
}
