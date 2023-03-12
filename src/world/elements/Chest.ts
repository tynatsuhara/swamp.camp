import { AnonymousComponent, Component, Entity, Point, pt } from "brigsby/dist"
import { AnimatedSpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { ChestAnimation } from "../../characters/ChestAnimation"
import { player } from "../../characters/player/index"
import { Icon } from "../../graphics/OneBitTileset"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Inventory, ItemStack } from "../../items/Inventory"
import { randomByteString } from "../../saves/uuid"
import { getIconSprite } from "../../ui/IconSprite"
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

        const { components, closeAnimation } = getChestComponents({
            location: wl,
            pixelPos: pos.times(TILE_SIZE),
            onInteract: () => InventoryDisplay.instance.open(closeAnimation, inventory),
        })

        const e = new Entity(components)

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
export const getChestComponents = ({
    location: wl,
    pixelPos,
    onInteract,
    canInteract = () => true,
    getIndicator = () => null,
}: {
    location: Location
    pixelPos: Point
    onInteract: () => void
    canInteract?: () => boolean
    getIndicator?: () => Icon
}): { components: Component[]; closeAnimation: () => void } => {
    const animator: AnimatedSpriteComponent = new AnimatedSpriteComponent(
        [
            ChestAnimation.open("empty", () => animator.pause()),
            ChestAnimation.close("empty", () => animator.pause()),
        ],
        SpriteTransform.new({
            position: pixelPos,
            depth: pixelPos.y + TILE_SIZE,
        })
    )
    let isOpen = false

    animator.pause()

    const interactable = new Interactable(
        pixelPos.plusX(TILE_SIZE / 2).plusY(10),
        () => {
            isOpen = true
            onInteract()
            animator.goToAnimation(0).play()
        },
        pt(0, -17),
        (interactor) => interactor === player() && canInteract()
    )

    const indicator = new AnonymousComponent({
        getRenderMethods: () => {
            const icon = getIndicator()
            if (!icon || interactable.isShowingUI) {
                return []
            }
            return [getIconSprite(icon, interactable.position.plusY(-TILE_SIZE))]
        },
    })

    const collider = new NavMeshCollider(wl, pixelPos.plus(pt(1, 9)), pt(14, 6))

    return {
        components: [animator, interactable, collider, indicator],
        closeAnimation: () => {
            if (isOpen) {
                animator.goToAnimation(1).play()
            }
            isOpen = false
        },
    }
}
