import { assets } from "../../engine/Assets"
import { Component } from "../../engine/Component"
import { Point } from "../../engine/Point"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Lists } from "../../engine/util/Lists"

export class ExplosionTileset {
    /**
     * returns an AnimatedTileComponent which will self-destruct once the animation completes
     */
    getExplosionAnimation(center: Point): AnimatedTileComponent {
        let component: AnimatedTileComponent
        
        // TODO: don't hardcode these when we need to support other sizes
        const size = 30
        const col = 375
        const row = 10
        const space = 4
        const speed = 65

        const pos = new Point(col, row)
        component = new TileSetAnimation(
            Lists.range(0, 4)
                    .map((index) => this.getTileAt(pos.plusX((size + space) * (index)), size))
                    .map(tileSource => [tileSource, speed]),
            () => component.delete()
        ).toComponent(TileTransform.new({ 
            position: center.plus(new Point(size, size).div(-2)), 
            depth: center.y + size/2
        }))

        return component
    }

    getMeteorAnimation(goal: Point, startDistance: number, onFinish: () => void): Component {
        const size = 15
        const col = 641
        const row = 79
        const speed = 1.2
        const startingPos = new Point(
            goal.x - size/2,  // center the sprite over the goal
            goal.y - startDistance
        )
        
        const component = this.getTileAt(new Point(col, row), size)
                .toComponent(TileTransform.new({ 
                    position: startingPos, 
                    depth: Number.MAX_SAFE_INTEGER
                }))

        component.update = (data) => {
            component.transform.position = component.transform.position.plusY(speed * data.elapsedTimeMillis)

            if (component.transform.position.y >= goal.y) {
                component.delete()
                onFinish()
            }
        }

        return component
    }

    private getTileAt(pos: Point, size: number) {
        return new StaticTileSource(
            this.image(), 
            pos,
            new Point(size, size)
        )
    }

    private image() {
        return assets.getImageByFileName("images/explosions.png")
    }
}