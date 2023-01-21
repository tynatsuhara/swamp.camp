import { Component, Point } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { startDonating } from "../../characters/dialogue/DonationBoxDialogue"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { getChestComponents } from "../elements/Chest"
import { Location } from "../locations/Location"

export class ConstructionSite extends Component {
    constructor(wl: Location, pos: Point, size: Point) {
        super()

        const corners = [
            pos,
            pos.plusX(size.x - 1),
            pos.plusY(size.y - 1),
            pos.plusX(size.x - 1).plusY(size.y - 1),
        ]

        this.awake = () => {
            this.entity.addComponents(
                getChestComponents(wl, pos, (onClose) => {
                    startDonating(onClose)
                })
            )
        }

        this.getRenderMethods = () => [
            ...corners.map((c) =>
                Tilesets.instance.outdoorTiles.getTileSource("trafficCone").toImageRender(
                    SpriteTransform.new({
                        position: c.times(TILE_SIZE),
                        depth: (c.y + 1) * TILE_SIZE - 3,
                    })
                )
            ),
            // new RectRender({
            //     depth: UIStateManager.UI_SPRITE_DEPTH,
            //     position: pos.times(TILE_SIZE),
            //     dimensions: size.times(TILE_SIZE),
            //     color: Color.PINK_3,
            // }),
        ]
    }
}
