import { debug, Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Condition } from "../characters/Condition"
import { Dude } from "../characters/Dude"
import { Player } from "../characters/Player"
import { ImageFilter, ImageFilters } from "../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { WorldTime } from "../world/WorldTime"
import { Color } from "./Color"
import { Cursor } from "./Cursor"
import { LocationTransition } from "./LocationTransition"
import { MiniMap } from "./MiniMap"
import { OffScreenIndicatorManager } from "./OffScreenIndicatorManager"
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
    private autosaveComponent: SpriteComponent
    private isShowingAutosaveIcon = false
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

    constructor() {
        this.autosaveComponent = new Entity().addComponent(
            Tilesets.instance.oneBit.getTileSource("floppy_drive").toComponent()
        )
        this.autosaveComponent.enabled = false
    }

    addIndicator(key: any, positionSupplier: () => Point) {
        this.offScreenIndicatorManager.addIndicator(key, positionSupplier)
    }

    removeIndicator(key: any) {
        this.offScreenIndicatorManager.removeIndicator(key)
    }

    refresh() {
        this.offScreenIndicatorManager.clear()
    }

    getEntities(player: Dude, screenDimensions: Point, elapsedMillis: number): Entity[] {
        this.updateHearts(player.health, player.maxHealth)
        this.updateAutosave(screenDimensions, elapsedMillis)

        const entities = [
            this.heartsEntity,
            this.autosaveComponent.entity,
            this.locationTransition.entity,
            this.offScreenIndicatorManager.getEntity(),
            this.miniMap.entity,
            new Entity([new Cursor(() => UIStateManager.instance.isMenuOpen)]),
        ]

        return entities
    }

    private updateHearts(health: number, maxHealth: number) {
        this.heartsEntity = new Entity()

        const filter: HeartFilter = (() => {
            if (debug.godMode) {
                return "god"
            } else if (Player.instance.dude.hasCondition(Condition.POISONED)) {
                return "poisoned"
            } else if (Player.instance.dude.hasCondition(Condition.HEALING)) {
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

            if (filter === "healing") {
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

        if (health % 1 > 0.5) {
            result.push(
                new SpriteComponent(full, new SpriteTransform(getHeartPosition(result.length)))
            )
        } else if (health % 1 > 0) {
            result.push(
                new SpriteComponent(half, new SpriteTransform(getHeartPosition(result.length)))
            )
        }

        while (result.length < maxHealth) {
            result.push(
                new SpriteComponent(empty, new SpriteTransform(getHeartPosition(result.length)))
            )
        }

        result.forEach((c) => this.heartsEntity.addComponent(c))
    }

    showSaveIcon() {
        this.isShowingAutosaveIcon = true
        this.autosaveComponent.enabled = true

        const timeToShowIcon = 3000
        setTimeout(() => {
            this.isShowingAutosaveIcon = false
        }, timeToShowIcon)
        setTimeout(() => {
            this.autosaveComponent.enabled = false
        }, timeToShowIcon + 1000)
    }

    private updateAutosave(screenDimensions: Point, elapsedMillis: number) {
        const base = screenDimensions.minus(this.offset).minus(new Point(TILE_SIZE, TILE_SIZE))
        let lerpRate = 0.005 * elapsedMillis
        if (this.autosaveComponent.transform.position.equals(Point.ZERO)) {
            // for initializing
            lerpRate = 1
        }
        const goal = this.isShowingAutosaveIcon ? Point.ZERO : new Point(0, 40)
        this.autosaveComponent.transform.position = this.autosaveComponent.transform.position
            .minus(base)
            .lerp(lerpRate, goal)
            .plus(base)
    }
}
