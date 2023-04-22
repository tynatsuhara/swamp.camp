import { debug, Entity, Point } from "brigsby/dist"
import {
    ImageFilter,
    SpriteComponent,
    SpriteTransform,
    StaticSpriteSource,
} from "brigsby/dist/sprites"
import { Condition } from "../characters/Condition"
import { player } from "../characters/player"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { Location } from "../world/locations/Location"
import { WorldTime } from "../world/WorldTime"
import { ClickableUI } from "./ClickableUI"
import { Color } from "./Color"
import { Cursor } from "./Cursor"
import { LocationTransition } from "./LocationTransition"
import { MiniMap } from "./MiniMap"
import { OffScreenIndicatorManager } from "./OffScreenIndicatorManager"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { UIStateManager } from "./UIStateManager"

type HeartFilter = "default" | "poisoned" | "god" | "healing"
const HEART_COLOR_FILTER: Record<HeartFilter, ImageFilter> = {
    default: (img) => img,
    poisoned: ImageFilters.recolor([Color.RED_3, Color.GREEN_6]),
    god: ImageFilters.recolor([Color.RED_3, Color.WHITE]),
    healing: ImageFilters.recolor([Color.RED_3, Color.PINK_3]),
}

const getFilteredVariants = (
    source: StaticSpriteSource
): Record<HeartFilter, StaticSpriteSource> => {
    return Object.keys(HEART_COLOR_FILTER).reduce((acc, cur) => {
        acc[cur] = source.filtered(HEART_COLOR_FILTER[cur])
        return acc
    }, {}) as Record<HeartFilter, StaticSpriteSource>
}

export class HUD {
    static get instance() {
        return Singletons.getOrCreate(HUD)
    }

    private heartsEntity: Entity = new Entity()
    private readonly offset = new Point(4, 4)
    private readonly offScreenIndicatorManager = new OffScreenIndicatorManager()
    readonly miniMap = new Entity().addComponent(new MiniMap())

    private readonly halfHeartSprites: Record<string, StaticSpriteSource> = getFilteredVariants(
        Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_half")
    )
    private readonly fullHeartSprites: Record<string, StaticSpriteSource> = getFilteredVariants(
        Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_full")
    )

    readonly locationTransition = new Entity().addComponent(new LocationTransition())

    addIndicator(key: any, positionSupplier: () => Point, locationSupplier: () => Location) {
        this.offScreenIndicatorManager.addIndicator(key, positionSupplier, locationSupplier)
    }

    removeIndicator(key: any) {
        this.offScreenIndicatorManager.removeIndicator(key)
    }

    refresh() {
        this.offScreenIndicatorManager.clear()
    }

    getEntities(): Entity[] {
        this.updateHearts(player().health, player().maxHealth)

        const entities = [
            this.heartsEntity,
            this.locationTransition.entity,
            this.offScreenIndicatorManager.getEntity(),
            this.miniMap.entity,
            new Entity([
                new Cursor(
                    // this is pretty disgusting
                    () =>
                        UIStateManager.instance.isMenuOpen &&
                        (ClickableUI.isActive ||
                            ClickableUI.currentMode === "cursor" ||
                            PlaceElementDisplay.instance.isOpen)
                ),
            ]),
        ]

        return entities
    }

    private updateHearts(health: number, maxHealth: number) {
        this.heartsEntity = new Entity()

        const healing = player().hasCondition(Condition.HEALING)
        const filter: HeartFilter = (() => {
            if (debug.godMode) {
                return "god"
            } else if (player().hasCondition(Condition.POISONED)) {
                return "poisoned"
            } else if (healing) {
                return "healing"
            }
            return "default"
        })()

        const full = this.fullHeartSprites[filter]
        const half = this.halfHeartSprites[filter]
        const empty = Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_empty")
        const result = []

        const getHeartPosition = (i: number) => {
            let pos = this.offset.plus(new Point(16, 0).times(i))

            if (healing) {
                const speed = 115
                const range = 1
                const time = WorldTime.instance.time
                const offset = range / 2 + range * Math.sin(Math.floor(time / speed) + i)
                pos = pos.plusY(Math.floor(offset))
            }

            return pos
        }

        const fullHearts = Math.floor(health)
        for (let i = 0; i < fullHearts; i++) {
            result.push(new SpriteComponent(full, new SpriteTransform(getHeartPosition(i))))
        }

        // partial heart
        if (health % 1 > 0) {
            // always show a partial heart if they're almost dead (< .5 health)
            if (health % 1 >= 0.5 || fullHearts === 0) {
                result.push(
                    new SpriteComponent(half, new SpriteTransform(getHeartPosition(result.length)))
                )
            } else {
                result.push(
                    new SpriteComponent(empty, new SpriteTransform(getHeartPosition(result.length)))
                )
            }
        }

        while (result.length < maxHealth) {
            result.push(
                new SpriteComponent(empty, new SpriteTransform(getHeartPosition(result.length)))
            )
        }

        result.forEach((c) => this.heartsEntity.addComponent(c))
    }
}
