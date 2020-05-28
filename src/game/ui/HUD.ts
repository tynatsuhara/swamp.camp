import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/point"
import { Dude } from "../characters/Dude"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Entity } from "../../engine/Entity"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { OffScreenMarker } from "./OffScreenMarker"

export class HUD {

    static instance: HUD

    private heartsEntity: Entity = new Entity()
    private autosaveComponent: TileComponent = new Entity().addComponent(
        Tilesets.instance.oneBit.getTileSource("floppy_drive").toComponent()
    )
    private isShowingAutosaveIcon = false
    private readonly offset = new Point(4, 4)

    // used for determining what should be updated
    private lastHealthCount = 0
    private lastMaxHealthCount = 0



    private offScreenMarker: OffScreenMarker = this.autosaveComponent.entity.addComponent(
        new OffScreenMarker()
    )



    constructor() {
        HUD.instance = this
    }

    getEntities(player: Dude, screenDimensions: Point, elapsedMillis: number): Entity[] {
        this.updateHearts(player.health, player.maxHealth)
        this.updateAutosave(screenDimensions, elapsedMillis);

        return [this.heartsEntity, this.autosaveComponent.entity]
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
            result.push(new TileComponent(full, new TileTransform(this.offset.plus(heartOffset.times(i)))))
        }

        if (health % 1 > .5) {
            result.push(new TileComponent(full, new TileTransform(this.offset.plus(heartOffset.times(result.length)))))
        } else if (health % 1 > 0) {
            result.push(new TileComponent(half, new TileTransform(this.offset.plus(heartOffset.times(result.length)))))
        }

        while (result.length < maxHealth) {
            result.push(new TileComponent(empty, new TileTransform(this.offset.plus(heartOffset.times(result.length)))))
        }

        result.forEach(c => this.heartsEntity.addComponent(c))
    }

    showSaveIcon() {
        this.isShowingAutosaveIcon = true
        setTimeout(() => { this.isShowingAutosaveIcon = false }, 4000);
    }

    private updateAutosave(screenDimensions: Point, elapsedMillis: number) {
        const base = screenDimensions.minus(this.offset).minus(new Point(TILE_SIZE, TILE_SIZE))
        if (this.autosaveComponent.transform.position.equals(Point.ZERO)) {  // for initializing
            this.autosaveComponent.transform.position = base
        }
        const goal = this.isShowingAutosaveIcon ? Point.ZERO : new Point(0, 40)
        this.autosaveComponent.transform.position = this.autosaveComponent.transform.position
                .minus(base)
                .lerp(0.005 * elapsedMillis, goal)
                .plus(base)
    }
}