import { Component } from "../../../engine/component"
import { Entity } from "../../../engine/Entity"
import { Point } from "../../../engine/point"
import { RenderMethod } from "../../../engine/renderer/RenderMethod"
import { StaticTileSource } from "../../../engine/tiles/StaticTileSource"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundRenderer } from "../GroundRenderer"
import { LocationManager } from "../LocationManager"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { GroundComponent } from "./GroundComponent"

const INDEX = "i"
const TALL_GRASS_COUNT = "t"

export const makeGrass = (d: MakeGroundFuncData): GroundComponent => {
    let tile: StaticTileSource
    const index = d.data[INDEX] ?? (Math.random() < .65 ? Math.floor(Math.random() * 4) : 0)
    const tallGrass = d.data[TALL_GRASS_COUNT] ?? (Math.random() < 0.05 ? 1 : 0)

    if (index > 0) {
        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, index))
    } else {
        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, 7))
    }

    GroundRenderer.instance.addTile(d.wl, d.pos, tile)

    const e = new Entity()

    for (let i = 0; i < tallGrass; i++) {
        e.addComponent(new TallGrass(d.pos))
    }

    return e.addComponent(new GroundComponent(
        GroundType.GRASS, 
        () => ({ 
            [INDEX]: index,
            [TALL_GRASS_COUNT]: tallGrass
        })
    ))
}

class TallGrass extends Component {

    private tilePos: Point

    constructor(tilePos: Point) {
        super()
        this.tilePos = tilePos

        const offset = new Point(
            -6 + Math.round(Math.random() * 11), 
            -TILE_SIZE + 2 + Math.round(Math.random() * (TILE_SIZE - 2))
        )
        const grassPos = tilePos.times(TILE_SIZE).plus(offset)

        const render = Tilesets.instance.outdoorTiles
                .getTileSource(`grass${Math.ceil(Math.random() * 2)}`)
                .toImageRender(new TileTransform(grassPos, null, 0, false, false, grassPos.y + TILE_SIZE))

        this.getRenderMethods = () => [render]
    }

    update() {
        if (LocationManager.instance.currentLocation.isOccupied(this.tilePos)) {
            this.delete()
        }
    }
}
