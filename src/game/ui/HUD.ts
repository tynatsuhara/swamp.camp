import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { Tilesets } from "../graphics/Tilesets"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/point"
import { Dude } from "../characters/Dude"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Entity } from "../../engine/Entity"
import { StringTiles } from "./StringTiles"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { TextRender } from "../../engine/renderer/TextRender"
import { Component } from "../../engine/component"
import { Items } from "../items/Items"

export class HUD {

    private readonly entity = new Entity()
    private readonly offset = new Point(4, 4)
    private readonly coinsOffset = new Point(0, 18)

    private coinCount: Component
    private hearts: TileComponent[] = []

    // used for determining what should be updated
    private lastHealthCount = 0
    private lastMaxHealthCount = 0
    private lastCoinsCount = -1

    constructor() {
        this.entity.addComponent(new AnimatedTileComponent(
            [Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)],
            new TileTransform(this.offset.plus(this.coinsOffset))
        ))
    }

    get(player: Dude): Entity {
        this.updateHearts(player.health, player.maxHealth)
        this.updateCoins(player.inventory.getItemCount(Items.COIN))

        return this.entity
    }

    private updateHearts(health: number, maxHealth: number) {
        if (this.lastHealthCount === health && this.lastMaxHealthCount === maxHealth) {
            return
        }
        this.lastHealthCount = health
        this.lastMaxHealthCount = maxHealth

        this.hearts.forEach(c => this.entity.removeComponent(c))

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

    private updateCoins(coins: number) {
        if (this.lastCoinsCount === coins) {
            return
        }
        this.lastCoinsCount = coins

        if (!!this.coinCount) {
            this.entity.removeComponent(this.coinCount)
        }
        this.coinCount = this.entity.addComponent(
            new BasicRenderComponent(
                new TextRender(`x${coins}`, new Point(9, 9).plus(this.offset).plus(this.coinsOffset), "24px 'Press Start 2P'", "#facb3e")
            )
        )
    }
}