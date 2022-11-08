import { Entity, Point } from "brigsby/dist"
import { AnimatedSpriteComponent, SpriteAnimation, SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Inventory, ItemStack } from "../../items/Inventory"
import { randomByteString } from "../../saves/uuid"
import { InventoryDisplay } from "../../ui/InventoryDisplay"
import { Location } from "../locations/Location"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"
import { NavMeshCollider } from "./NavMeshCollider"

type SaveData = {
    id: string
    i: ItemStack[]
}

export class ChestFactory extends ElementFactory<ElementType.CHEST, SaveData> {
    dimensions = new Point(1, 1)

    constructor() {
        super(ElementType.CHEST)
    }

    make(wl: Location, pos: Point, data: Partial<SaveData>) {
        const id = data.id ?? randomByteString()
        const inventory = new Inventory(id)
        if (data.i) {
            inventory.load(data.i)
        }

        const tiles =
            Tilesets.instance.dungeonCharacters.getTileSetAnimationFrames("chest_empty_open_anim")
        const openSpeed = 80
        const closeSpeed = 20
        const animator: AnimatedSpriteComponent = new AnimatedSpriteComponent(
            [
                // opening
                new SpriteAnimation(
                    [
                        [tiles[0], openSpeed],
                        [tiles[1], openSpeed],
                        [tiles[2], openSpeed],
                    ],
                    () => animator.pause()
                ),
                // closing
                new SpriteAnimation(
                    [
                        [tiles[2], closeSpeed],
                        [tiles[1], closeSpeed],
                        [tiles[0], closeSpeed],
                    ],
                    () => animator.pause()
                ),
            ],
            SpriteTransform.new({
                position: pos.times(TILE_SIZE),
                depth: pos.y * TILE_SIZE + TILE_SIZE,
            })
        )

        animator.pause()

        const interactable = new Interactable(
            pos
                .times(TILE_SIZE)
                .plusX(TILE_SIZE / 2)
                .plusY(10),
            () => {
                InventoryDisplay.instance.open(() => animator.goToAnimation(1).play(), inventory)
                animator.goToAnimation(0).play()
            },
            new Point(0, -17)
        )

        const collider = new NavMeshCollider(
            wl,
            pos.times(TILE_SIZE).plusY(9),
            new Point(TILE_SIZE, 7)
        )

        const e = new Entity([animator, interactable, collider])

        return e.addComponent(
            new ElementComponent(this.type, pos, () => ({
                id,
                i: inventory.save(),
            }))
        )
    }
}
