import { AnonymousComponent, Component, Point, pt } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { startDonating } from "../../characters/dialogue/DonationBoxDialogue"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ItemStack } from "../../items/Inventory"
import { Item } from "../../items/Items"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { getChestComponents } from "../elements/Chest"
import { Location } from "../locations/Location"

export class ConstructionSite extends Component {
    private donationComplete = false

    constructor(wl: Location, pos: Point, readonly size: Point, onBuildComplete: () => void) {
        super()

        const corners = [
            pos,
            pos.plusX(size.x - 1),
            pos.plusY(size.y - 1),
            pos.plusX(size.x - 1).plusY(size.y - 1),
        ]

        // TODO
        const itemsRequired: ItemStack[] = [
            new ItemStack(Item.WOOD, 20),
            new ItemStack(Item.ROCK, 10),
        ]

        // TODO
        const onDonationComplete = () => {
            this.donationComplete = true
            onBuildComplete()
        }

        const chestPos = pos.minus(pt(0.5)).plus(size.div(2)).times(TILE_SIZE)

        const { components, closeAnimation } = getChestComponents(
            wl,
            chestPos,
            () => {
                startDonating({ onDonationComplete, itemsRequired })
            },
            () => !this.donationComplete
        )

        this.awake = () => {
            this.entity.addComponents(components)
            this.entity.addComponent(
                new AnonymousComponent({
                    update: () => {
                        if (!DialogueDisplay.instance.isOpen) {
                            closeAnimation()
                        }
                    },
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
        ]
    }
}
