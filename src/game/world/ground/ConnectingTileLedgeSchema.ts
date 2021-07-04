import { StaticSpriteSource } from "../../../engine/sprites/StaticSpriteSource"
import { Point } from "../../../engine/Point"
import { ImageRender } from "../../../engine/renderer/ImageRender"
import { SpriteTransform } from "../../../engine/sprites/SpriteTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { WorldLocation } from "../WorldLocation"
import { GroundRenderer } from "../GroundRenderer"

/**
 * Defines how a type of connecting tiles interacts with other types of connecting tiles.
 */
export class ConnectingTileLedgeSchema extends ConnectingTileSchema {

    canConnect(schema: ConnectingTileSchema) {
        return schema instanceof ConnectingTileLedgeSchema
    }
   
    /**
     * Renders the tile source based on the given grid and position
     */
    render(location: WorldLocation, position: Point): ImageRender[] {
        const level = location.levels.get(position)
        const x = position.x
        const y = position.y

        const n = location.levels.get(new Point(x, y - 1))
        const ne = location.levels.get(new Point(x + 1, y - 1))
        const e = location.levels.get(new Point(x + 1, y))
        const se = location.levels.get(new Point(x + 1, y + 1))
        const s = location.levels.get(new Point(x, y + 1))
        const sw = location.levels.get(new Point(x - 1, y + 1))
        const w = location.levels.get(new Point(x - 1, y))
        const nw = location.levels.get(new Point(x - 1, y - 1))
        
        const render = (source: Point, mirrorX = false) => {
            return Tilesets.instance.tilemap.getTileAt(source)
                    .toImageRender(SpriteTransform.new({ 
                        position: position.times(TILE_SIZE), 
                        depth: GroundRenderer.DEPTH + 1,
                        mirrorX
                    }))
        }

        /**
         * Preconditions: 
         *   - Every ledge should have at least 2 adjacent ledges (not across from each other) 
         *   - No ledge should have 4 N/E/S/W connections
         */ 

        let result: ImageRender

        if (w === level && e === level && n < level) {
            // this is a top ledge
            result = render(new Point(2, 0))
        } else if (w === level && e === level && s < level) {
            // this is a bottom ledge
            result = this.getBottomLedge(render)
        } else if (n === level && s === level && e < level) {
            // this is a right ledge
            if (ne === level) {
                result = render(new Point(6, 9), true)
            } else if (se === level) {
                result = render(new Point(4, 9), true)
            } else {
                result = render(new Point(5, 9), true)
            }
        } else if (n === level && s === level && w < level) {
            // this is a left ledge
            if (nw === level) {
                result = render(new Point(6, 9))
            } else if (sw === level) {
                result = render(new Point(4, 9))
            } else {
                result = render(new Point(5, 9))
            }
        } else if (s < level && w < level) {
            // bottom left corner
            result = render(new Point(5, 8))
        } else if (s < level && e < level) {
            // bottom right corner
            result = render(new Point(5, 8), true)
        } else if (n < level && w < level) {
            // top left corner
            result = render(new Point(5, 10))
        } else if (n < level && e < level) {
            // top right corner
            result = render(new Point(5, 10), true)
        } else if (se < level) {
            // top left inside corner 
            result = render(new Point(7, 7), true)
        } else if (sw < level) {
            // top right inside corner 
            result = render(new Point(7, 7))
        } else if (ne < level) {
            // bottom left inside corner 
            result = render(new Point(4, 8), true)
        } else if (nw < level) {
            // bottom right inside corner 
            result = render(new Point(4, 8))
        }

        if (!result) {
            return []
        }

        return [result]
    }

    private bottomLedge: ImageRender
    private getBottomLedge(render: (source: Point, mirrorX: boolean) => ImageRender) {
        if (!this.bottomLedge) {
            if (Math.random() < .3) {
                this.bottomLedge = render(new Point(6, 7), Math.random() > .5)
            } else {
                const choices = 5
                this.bottomLedge = render(new Point(1 + Math.floor(Math.random() * choices), 7), Math.random() > .5)
            }
        }
        return this.bottomLedge
    }
}
