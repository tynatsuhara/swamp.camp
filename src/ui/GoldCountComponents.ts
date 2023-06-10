import { Component, Point } from "brigsby/dist"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { AnimatedSpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { saveManager } from "../core/SaveManager"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets } from "../graphics/Tilesets"
import { Color } from "./Color"
import { formatText } from "./Text"
import { UI_SPRITE_DEPTH } from "./UiConstants"

export const getGoldCountComponents = (position: Point): Component[] => {
    const dropShadow = Color.RED_1

    const coinAnim = new AnimatedSpriteComponent(
        [Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)],
        new SpriteTransform(position)
    )
    const coinAnimDropShadow = new AnimatedSpriteComponent(
        [Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)],
        SpriteTransform.new({
            position: position.plusX(-1).plusY(1),
            depth: coinAnim.transform.depth - 1,
        })
    )
    coinAnimDropShadow.applyFilter(ImageFilters.tint(dropShadow))

    return [
        // coins
        coinAnim,
        coinAnimDropShadow,
        new BasicRenderComponent(
            ...formatText({
                text: `x${saveManager.getState().coins}`,
                position: new Point(9, 1).plus(position),
                color: Color.RED_6,
                depth: UI_SPRITE_DEPTH,
                dropShadow,
            })
        ),
    ]
}
