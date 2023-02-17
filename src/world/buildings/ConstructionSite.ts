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
    constructor(
        wl: Location,
        pos: Point,
        readonly size: Point,
        private readonly getHasMaterials: () => boolean,
        setHasMaterials: () => void,
        setBuildComplete: () => void // TODO figure out where this gets called
    ) {
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

        const chestPos = pos.plus(pt(size.x / 2 - 0.5, size.y - 1)).times(TILE_SIZE)

        const { components, closeAnimation } = getChestComponents(
            wl,
            chestPos,
            () => {
                startDonating({ onDonationComplete: setHasMaterials, itemsRequired })
            },
            () => !this.hasMaterials()
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

    hasMaterials() {
        return this.getHasMaterials()
    }
}
