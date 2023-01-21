import { Component, Entity, Point, pt } from "brigsby/dist"
import { AnimatedSpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { ChestAnimation } from "../../characters/ChestAnimation"
import { player } from "../../characters/player/index"
import { TILE_SIZE } from "../../graphics/Tilesets"
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
    dimensions = pt(1)

    constructor() {
        super(ElementType.CHEST)
    }

    make(wl: Location, pos: Point, data: Partial<SaveData>) {
        const id = data.id ?? randomByteString(10)
        const inventory = new Inventory(id, true)
        if (data.i) {
            inventory.load(data.i)
        }

        const e = new Entity(
            getChestComponents(wl, pos, (onClose) =>
                InventoryDisplay.instance.open(onClose, inventory)
            )
        )

        return e.addComponent(
            new ElementComponent(this.type, pos, () => ({
                id,
                i: inventory.save(),
            }))
        )
    }
}

/**
 * A utility for creating interactice chests
 */
export const getChestComponents = (
    wl: Location,
    pos: Point,
    onInteract: (onClose: () => void) => void
): Component[] => {
    const animator: AnimatedSpriteComponent = new AnimatedSpriteComponent(
        [
            ChestAnimation.open("empty", () => animator.pause()),
            ChestAnimation.close("empty", () => animator.pause()),
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
            onInteract(() => animator.goToAnimation(1).play())
            animator.goToAnimation(0).play()
        },
        pt(0, -17),
        (interactor) => interactor === player()
    )

    const collider = new NavMeshCollider(wl, pos.times(TILE_SIZE).plus(pt(1, 9)), pt(14, 6))

    return [animator, interactable, collider]
}
