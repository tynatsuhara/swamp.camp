import { Component, Point } from "brigsby/dist"
import {
    AnimatedSpriteComponent,
    SpriteAnimation,
    SpriteTransform,
    StaticSpriteSource,
} from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { getImage } from "./Tilesets"

export class ExplosionTileset {
    /**
     * returns an AnimatedTileComponent which will self-destruct once the animation completes
     */
    getExplosionAnimation(center: Point): AnimatedSpriteComponent {
        let component: AnimatedSpriteComponent

        // TODO: don't hardcode these when we need to support other sizes/colors
        const size = 30
        const col = 376
        const row = 298
        const space = 4
        const speed = 35

        const pos = new Point(col, row)
        const animation = Lists.range(0, 7).map((index): [StaticSpriteSource, number] => {
            const tileSource = this.getTileAt(pos.plusX((size + space) * index), size)
            return [tileSource, index === 0 ? speed * 3 : speed]
        })

        component = new SpriteAnimation(animation, () => component.delete()).toComponent(
            SpriteTransform.new({
                position: center.plus(new Point(size, size).div(-2)),
                depth: center.y + size / 2,
            })
        )

        return component
    }

    getMeteorAnimation(goal: Point, startDistance: number, onFinish: () => void): Component {
        const size = 15
        const col = 641
        const row = 79
        const speed = 1.2
        const startingPos = new Point(
            goal.x - size / 2, // center the sprite over the goal
            goal.y - startDistance
        )

        const component = this.getTileAt(new Point(col, row), size).toComponent(
            SpriteTransform.new({
                position: startingPos,
                depth: Number.MAX_SAFE_INTEGER,
            })
        )

        component.update = (data) => {
            component.transform.position = component.transform.position.plusY(
                speed * data.elapsedTimeMillis
            )

            if (component.transform.position.y >= goal.y) {
                component.delete()
                onFinish()
            }
        }

        return component
    }

    private getTileAt(pos: Point, size: number) {
        return new StaticSpriteSource(this.image(), pos, new Point(size, size))
    }

    private image() {
        return getImage("images/explosions.png")
    }
}
