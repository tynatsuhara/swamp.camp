import { Component } from "../../engine/component"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Point } from "../../engine/point"
import { makeNineSliceComponents } from "../../engine/tiles/NineSlice"
import { UIStateManager } from "./UIStateManager"
import { LocationManager } from "../world/LocationManager"
import { UpdateData } from "../../engine/engine"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { rectContains } from "../../engine/util/utils"
import { TileTransform } from "../../engine/tiles/TileTransform"

/**
 * This is a separate component which exists in the game view instead of the UI view, since it aligns with world tile coordinates
 */
export class PlaceElementFrame extends Component {

    private readonly dimensions: Point
    private goodTiles: TileComponent[]
    private badTiles: TileComponent[]

    constructor(dimensions: Point) {
        super()
        this.dimensions = dimensions
        if ((this.dimensions.x === 1 && this.dimensions.y !== 1) || (this.dimensions.y === 1 && this.dimensions.x !== 1)) {
            throw new Error("haven't implemented small element placing yet :(")
        }
    }

    start() {
        this.goodTiles = this.entity.addComponents(this.getTiles("good"))
        this.goodTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH
        
        this.badTiles = this.entity.addComponents(this.getTiles("bad"))
        this.badTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH
    }

    private getTiles(suffix: string): TileComponent[] {
        if (this.dimensions.x === 1 || this.dimensions.y ===1) {
            return [Tilesets.instance.outdoorTiles.getTileSource(`placingElementFrame_small_${suffix}`).toComponent(new TileTransform())]
        }
        return makeNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice(`placingElementFrame_${suffix}`), 
            new Point(0, 0),
            this.dimensions
        )
    }

    update(updateData: UpdateData) {
        const startPos = updateData.input.mousePos
        const tilePt = this.pixelPtToTilePt(startPos.minus(new Point(this.dimensions.x/2, this.dimensions.y/2).times(TILE_SIZE)))

        const canPlace = this.canPlace(tilePt)
        this.goodTiles.forEach(t => t.enabled = canPlace)
        this.badTiles.forEach(t => t.enabled = !canPlace)

        this.goodTiles[0].transform.position = tilePt.times(TILE_SIZE)
        this.badTiles[0].transform.position = tilePt.times(TILE_SIZE)

        if (canPlace && updateData.input.isMouseDown) {
            PlaceElementDisplay.instance.finishPlacing(tilePt)
        }
    }

    delete() {
        this.goodTiles.forEach(t => t.delete())
        this.badTiles.forEach(t => t.delete())
        super.delete()
    }

    private pixelPtToTilePt(pixelPt: Point) {
        return pixelPt.apply(n => 
            Math.round(Math.abs(n)/TILE_SIZE) * Math.sign(n)
        )
    }

    private canPlace(pos: Point) {
        for (let x = pos.x; x < pos.x + this.dimensions.x; x++) {
            for (let y = pos.y; y < pos.y + this.dimensions.y; y++) {
                if (!!LocationManager.instance.currentLocation.elements.get(new Point(x, y))) {
                    return false
                }
            }
        }
        const p = pos.times(TILE_SIZE)
        const d = this.dimensions.times(TILE_SIZE)
        return !Array.from(LocationManager.instance.currentLocation.dudes).some(dude => 
            rectContains(p, d, dude.standingPosition) || rectContains(p, d, dude.standingPosition.plusY(-TILE_SIZE))
        )
    }
}