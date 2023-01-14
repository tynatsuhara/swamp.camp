import { Entity } from "brigsby/dist"
import { ConnectingTile } from "./ConnectingTile"
import { ConnectingTileWaterSchema } from "./ConnectingTileWaterSchema"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { GroundComponent } from "./GroundComponent"
import { WaterRenderer } from "./WaterRenderer"

export const makeWater = (d: MakeGroundFuncData): GroundComponent => {
    const schema = new ConnectingTileWaterSchema()

    WaterRenderer.instance.setWaterTile(d.wl, d.pos)

    const e = new Entity([new ConnectingTile(schema, d.wl, d.pos)])

    return e.addComponent(new GroundComponent(GroundType.WATER))
}
