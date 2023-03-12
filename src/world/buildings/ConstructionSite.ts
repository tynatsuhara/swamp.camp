import { AnonymousComponent, Component, Point, pt } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { DONATION_DIALOGUE, startDonating } from "../../characters/dialogue/DonationBoxDialogue"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ItemStack } from "../../items/Inventory"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { getChestComponents } from "../elements/Chest"
import { Location } from "../locations/Location"

export type ConstructionState = {
    hasSupplies: boolean
    hoursLeft: number
}

/**
 * TODO Future improvements:
 *   - Update construction hourly instead of daily
 *   - Notification (push or Herald) when construction completes
 */
export class ConstructionSite extends Component {
    dialogue = DONATION_DIALOGUE

    constructor(
        wl: Location,
        pos: Point,
        readonly size: Point,
        private readonly mutableState: ConstructionState,
        itemsRequired: ItemStack[],
        private readonly completeConstruction: () => void
    ) {
        super()

        const corners = [
            pos,
            pos.plusX(size.x - 1),
            pos.plusY(size.y - 1),
            pos.plusX(size.x - 1).plusY(size.y - 1),
        ]

        const chestPos = pos.plus(pt(size.x / 2 - 0.5, size.y - 1)).times(TILE_SIZE)

        const { components, closeAnimation } = getChestComponents({
            location: wl,
            pixelPos: chestPos,
            onInteract: () => {
                startDonating(
                    {
                        onDonationComplete: () => {
                            this.mutableState.hasSupplies = true
                        },
                        itemsRequired,
                    },
                    this
                )
            },
            canInteract: () => !this.hasMaterials(),
            getIndicator: () => {
                if (!this.hasMaterials() && DialogueDisplay.instance.currentSource !== this) {
                    return "!"
                }
            },
        })

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

    hasMaterials() {
        return !!this.mutableState.hasSupplies
    }

    makeProgress(hoursWorked: number) {
        this.mutableState.hoursLeft -= hoursWorked
        if (this.mutableState.hoursLeft <= 0) {
            this.completeConstruction()
        }
    }
}
