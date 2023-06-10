import { Component, Point } from "brigsby/dist"
import { NineSlice, SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Maths } from "brigsby/dist/util"
import { player } from "../characters/player"
import { controls } from "../core/Controls"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { Elements } from "../world/elements/Elements"
import { here } from "../world/locations/LocationManager"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { UI_SPRITE_DEPTH } from "./UiConstants"

/**
 * This is a separate component which exists in the game view instead of the UI view, since it aligns with world tile coordinates
 */
export class PlaceElementFrame extends Component {
    private goodTiles: SpriteComponent[]
    private badTiles: SpriteComponent[]

    constructor(private readonly dimensions: Point) {
        super()
        if (
            (this.dimensions.x === 1 && this.dimensions.y > 2) ||
            (this.dimensions.y === 1 && this.dimensions.x !== 1)
        ) {
            throw new Error("haven't implemented small element placing yet :(")
        }
    }

    start() {
        this.goodTiles = this.entity.addComponents(this.getTiles("good"))
        this.goodTiles[0].transform.depth = UI_SPRITE_DEPTH

        this.badTiles = this.entity.addComponents(this.getTiles("bad"))
        this.badTiles[0].transform.depth = UI_SPRITE_DEPTH
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
            Tilesets.instance.outdoorTiles
                .getNineSlice(`placingElementFrame_${suffix}`)
                .map((s) => () => s),
            this.dimensions
        ).sprites.values()
    }

    update() {
        const mousePos = controls.getWorldSpaceCursorPos()
        const baseDist = 1.2
        // Divide these by 2 since the mouse will be in the center of the frame
        const maxDistX = TILE_SIZE * (baseDist + this.dimensions.x / 2)
        const maxDistY = TILE_SIZE * (baseDist + this.dimensions.y / 2)
        const playerPos = player().standingPosition.plusY(-TILE_SIZE / 2)

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

        if (canPlace && controls.isMenuClickDown()) {
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
        const l = here()
        for (let x = pos.x; x < pos.x + this.dimensions.x; x++) {
            for (let y = pos.y; y < pos.y + this.dimensions.y; y++) {
                const pt = new Point(x, y)
                // there's already an element here
                const existingElement = l.getElement(pt)
                if (existingElement) {
                    return false
                }
                // there's no ground here
                if (!l.getGround(pt)) {
                    return false
                }
            }
        }

        return Elements.instance
            .getElementFactory(PlaceElementDisplay.instance.getElementType())
            .canPlaceAtPos(l, pos)
    }
}
