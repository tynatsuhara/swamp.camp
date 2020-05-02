import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { Tilesets } from "../graphics/Tilesets"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/point"
import { Dude } from "../characters/Dude"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Entity } from "../../engine/Entity"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { TextRender } from "../../engine/renderer/TextRender"
import { Component } from "../../engine/component"
import { Items } from "../items/Items"
import { TEXT_STYLE } from "./Text"
import { Color } from "./Color"

export class HUD {

    private entity: Entity = new Entity()
    private readonly offset = new Point(4, 4)

    // used for determining what should be updated
    private lastHealthCount = 0
    private lastMaxHealthCount = 0

    getEntity(player: Dude): Entity {
        this.updateHearts(player.health, player.maxHealth)

        return this.entity
    }

    private updateHearts(health: number, maxHealth: number) {
        if (this.lastHealthCount === health && this.lastMaxHealthCount === maxHealth) {
            return
        }
        this.lastHealthCount = health
        this.lastMaxHealthCount = maxHealth

        this.entity = new Entity()

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

        result.forEach(c => this.entity.addComponent(c))
    }
}