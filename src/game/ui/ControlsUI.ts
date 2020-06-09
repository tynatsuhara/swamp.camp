import { KeyPressIndicator } from "./KeyPressIndicator"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/point"
import { InputKey } from "../../engine/input"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Tooltip } from "./Tooltip"
import { formatText } from "./Text"
import { Color } from "./Color"
import { Component } from "../../engine/component"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { UIStateManager } from "./UIStateManager"

export const makeControlsUI = (dimensions: Point, offset: Point): RenderMethod[] => {
    const topLeft = new Point(dimensions.x/2 - TILE_SIZE*4, dimensions.y/2 - TILE_SIZE*5).plus(offset)

    return [
        ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE), InputKey.W).getRenderMethods(),
        ...new KeyPressIndicator(topLeft.plusY(TILE_SIZE), InputKey.A).getRenderMethods(),
        ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE).plusY(TILE_SIZE), InputKey.S).getRenderMethods(),
        ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE * 2).plusY(TILE_SIZE), InputKey.D).getRenderMethods(),
        Tilesets.instance.oneBit.getTileSource("leftClick").toImageRender(new TileTransform(topLeft.plusX(TILE_SIZE*4))),
        Tilesets.instance.oneBit.getTileSource("rightClick").toImageRender(new TileTransform(topLeft.plusX(TILE_SIZE*4).plusY(TILE_SIZE * 1))),
        ...formatText("MOVE", Color.WHITE, topLeft.plusX(TILE_SIZE/2).plusY(TILE_SIZE*2+2), 100),
        ...formatText("ATTACK", Color.WHITE, topLeft.plusX(TILE_SIZE*5).plusY(4), 100),
        ...formatText("BLOCK", Color.WHITE, topLeft.plusX(TILE_SIZE*5).plusY(TILE_SIZE + 4), 100),
    ].map(r => {
        r.depth = UIStateManager.UI_SPRITE_DEPTH
        return r
    })
}