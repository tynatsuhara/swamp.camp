import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { NineSlice } from "brigsby/dist/sprites/NineSlice"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Maths } from "brigsby/dist/util/Maths"
import { Player } from "../characters/Player"
import { controls } from "../Controls"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Elements } from "../world/elements/Elements"
import { LocationManager } from "../world/LocationManager"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { UIStateManager } from "./UIStateManager"

/**
 * This is a separate component which exists in the game view instead of the UI view, since it aligns with world tile coordinates
 */
export class PlaceElementFrame extends Component {
    private readonly dimensions: Point
    private goodTiles: SpriteComponent[]
    private badTiles: SpriteComponent[]

    constructor(dimensions: Point) {
        super()
        this.dimensions = dimensions
        if (
            (this.dimensions.x === 1 && this.dimensions.y > 2) ||
            (this.dimensions.y === 1 && this.dimensions.x !== 1)
        ) {
            throw new Error("haven't implemented small element placing yet :(")
        }
    }

    start() {
        this.goodTiles = this.entity.addComponents(this.getTiles("good"))
        this.goodTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH

        this.badTiles = this.entity.addComponents(this.getTiles("bad"))
        this.badTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH
    }

    private getTiles(suffix: string): SpriteComponent[] {
        if (this.dimensions.equals(new Point(1, 2))) {
            const top = Tilesets.instance.outdoorTiles
                .getTileSource(`placingElementFrame_1x2_${suffix}_top`)
                .toComponent(new SpriteTransform())
            const bottom = Tilesets.instance.outdoorTiles
                .getTileSource(`placingElementFrame_1x2_${suffix}_bottom`)
                .toComponent(new SpriteTransform(new Point(0, TILE_SIZE)).relativeTo(top.transform))
            return [top, bottom]
        }
        if (this.dimensions.x === 1 || this.dimensions.y === 1) {
            return [
                Tilesets.instance.outdoorTiles
                    .getTileSource(`placingElementFrame_small_${suffix}`)
                    .toComponent(new SpriteTransform()),
            ]
        }
        return NineSlice.makeNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice(`placingElementFrame_${suffix}`),
            new Point(0, 0),
            this.dimensions
        )
    }

    update() {
        const mousePos = controls.getMousePos()
        const baseDist = 2
        const maxDistX = TILE_SIZE * (baseDist + this.dimensions.x / 2)
        const maxDistY = TILE_SIZE * (baseDist + this.dimensions.y / 2)
        const playerPos = Player.instance.dude.standingPosition.plusY(-TILE_SIZE / 2)

        // only allow placing near the player
        const centerPos = new Point(
            Maths.clamp(mousePos.x, playerPos.x - maxDistX, playerPos.x + maxDistX),
            Maths.clamp(mousePos.y, playerPos.y - maxDistY, playerPos.y + maxDistY)
        )

        const tilePt = this.pixelPtToTilePt(
            centerPos.minus(
                new Point(this.dimensions.x / 2, this.dimensions.y / 2).times(TILE_SIZE)
            )
        )

        const canPlace = this.canPlace(tilePt)
        this.goodTiles.forEach((t) => (t.enabled = canPlace))
        this.badTiles.forEach((t) => (t.enabled = !canPlace))

        this.goodTiles[0].transform.position = tilePt.times(TILE_SIZE)
        this.badTiles[0].transform.position = tilePt.times(TILE_SIZE)

        if (canPlace && controls.isMouseDown()) {
            PlaceElementDisplay.instance.finishPlacing(tilePt)
        }
    }

    // it's a mystery why this implementation is different than the standard one
    private pixelPtToTilePt = (pixelPt: Point) => {
        return pixelPt.apply((n) => Math.round(Math.abs(n) / TILE_SIZE) * Math.sign(n))
    }

    delete() {
        this.goodTiles.forEach((t) => t.delete())
        this.badTiles.forEach((t) => t.delete())
        super.delete()
    }

    private canPlace(pos: Point) {
        for (let x = pos.x; x < pos.x + this.dimensions.x; x++) {
            for (let y = pos.y; y < pos.y + this.dimensions.y; y++) {
                const pt = new Point(x, y)
                // there's already an element here
                if (!!LocationManager.instance.currentLocation.getElement(pt)) {
                    return false
                }
                // there's no ground here
                if (!LocationManager.instance.currentLocation.getGround(pt)) {
                    return false
                }
            }
        }

        const p = pos.times(TILE_SIZE)
        const d = this.dimensions.times(TILE_SIZE)
        const wl = LocationManager.instance.currentLocation
        const intersectingDudes = Array.from(wl.dudes).some(
            (dude) =>
                Maths.rectContains(p, d, dude.standingPosition) ||
                Maths.rectContains(p, d, dude.standingPosition.plusY(-TILE_SIZE))
        )
        if (intersectingDudes) {
            return false
        }

        return Elements.instance
            .getElementFactory(PlaceElementDisplay.instance.getElementType())
            .canPlaceAtPos(wl, pos)
    }
}
