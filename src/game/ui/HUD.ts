import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/point"
import { Dude } from "../characters/Dude"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Entity } from "../../engine/Entity"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"

export class HUD {

    static instance: HUD

    private heartsEntity: Entity = new Entity()
    private autosaveComponent: AnimatedTileComponent = new Entity().addComponent(
        new AnimatedTileComponent([
            Tilesets.instance.oneBit.getTileSetAnimation("autosave", 6, 100)
        ])
    )
    private readonly offset = new Point(4, 4)

    // used for determining what should be updated
    private lastHealthCount = 0
    private lastMaxHealthCount = 0

    constructor() {
        HUD.instance = this

        this.autosaveComponent.enabled = false
    }

    getEntities(player: Dude, screenDimensions: Point): Entity[] {
        this.updateHearts(player.health, player.maxHealth)
        this.updateAutosave(screenDimensions);

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
        this.autosaveComponent.enabled = true
        setTimeout(() => { this.autosaveComponent.enabled = false }, 4000);
    }

    private updateAutosave(screenDimensions: Point) {
        this.autosaveComponent.transform.position = screenDimensions.minus(this.offset).minus(new Point(TILE_SIZE, TILE_SIZE))
    }
}