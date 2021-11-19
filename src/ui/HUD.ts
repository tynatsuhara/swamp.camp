import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Dude } from "../characters/Dude"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { LocationTransition } from "./LocationTransition"
import { MiniMap } from "./MiniMap"
import { OffScreenIndicatorManager } from "./OffScreenIndicatorManager"

export class HUD {
    static get instance() {
        return Singletons.getOrCreate(HUD)
    }

    private heartsEntity: Entity = new Entity()
    private autosaveComponent: SpriteComponent = new Entity().addComponent(
        Tilesets.instance.oneBit.getTileSource("floppy_drive").toComponent()
    )
    private isShowingAutosaveIcon = false
    private readonly offset = new Point(4, 4)
    private readonly offScreenIndicatorManager = new OffScreenIndicatorManager()
    readonly miniMap = new Entity().addComponent(new MiniMap())

    // used for determining what should be updated
    private lastHealthCount = 0
    private lastMaxHealthCount = 0

    readonly locationTransition = new Entity().addComponent(new LocationTransition())

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

        return [
            this.heartsEntity,
            this.autosaveComponent.entity,
            this.locationTransition.entity,
            this.offScreenIndicatorManager.getEntity(),
            this.miniMap.entity,
        ]
    }

    private updateHearts(health: number, maxHealth: number) {
        if (this.lastHealthCount === health && this.lastMaxHealthCount === maxHealth) {
            return
        }
        this.lastHealthCount = health
        this.lastMaxHealthCount = maxHealth

        this.heartsEntity = new Entity()

        const heartOffset = new Point(16, 0)
        const full = Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_full")
        const half = Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_half")
        const empty = Tilesets.instance.dungeonCharacters.getTileSource("ui_heart_empty")
        const result = []

        const fullHearts = Math.floor(health)
        for (let i = 0; i < fullHearts; i++) {
            result.push(
                new SpriteComponent(
                    full,
                    new SpriteTransform(this.offset.plus(heartOffset.times(i)))
                )
            )
        }

        if (health % 1 > 0.5) {
            result.push(
                new SpriteComponent(
                    full,
                    new SpriteTransform(this.offset.plus(heartOffset.times(result.length)))
                )
            )
        } else if (health % 1 > 0) {
            result.push(
                new SpriteComponent(
                    half,
                    new SpriteTransform(this.offset.plus(heartOffset.times(result.length)))
                )
            )
        }

        while (result.length < maxHealth) {
            result.push(
                new SpriteComponent(
                    empty,
                    new SpriteTransform(this.offset.plus(heartOffset.times(result.length)))
                )
            )
        }

        result.forEach((c) => this.heartsEntity.addComponent(c))
    }

    showSaveIcon() {
        this.isShowingAutosaveIcon = true
        setTimeout(() => {
            this.isShowingAutosaveIcon = false
        }, 3000)
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
