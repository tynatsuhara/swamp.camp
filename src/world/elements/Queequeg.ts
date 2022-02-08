import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { AnimatedSpriteComponent } from "brigsby/dist/sprites/AnimatedSpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Lists } from "brigsby/dist/util/Lists"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { DudeAnimationUtils } from "../../characters/DudeAnimationUtils"
import { Particles } from "../../graphics/Particles"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Color } from "../../ui/Color"
import { Location } from "../Location"
import { Simulatable } from "../Simulatable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { ElementUtils } from "./ElementUtils"

type QueequegData = {
    docked: boolean
}

export class QueequegFactory extends ElementFactory {
    type = ElementType.QUEEQUEG
    dimensions = new Point(6, 3)

    make(wl: Location, pos: Point, data: QueequegData): ElementComponent {
        const e = new Entity()

        const dockedPosition = pos.times(TILE_SIZE).plusX(1)
        const atSeaPosition = dockedPosition.plusX(TILE_SIZE * 7)

        const ship = e.addComponent(new Queequeg(dockedPosition, atSeaPosition, data.docked))
        window["queequeg"] = ship

        // TODO: Add a teleporter to get on top of the ship?

        return e.addComponent(
            new ElementComponent(
                this.type,
                pos,
                ElementUtils.rectPoints(pos, this.dimensions),
                (): QueequegData => ({
                    docked: ship.isDocked,
                })
            )
        )
    }
}

class Queequeg extends Simulatable {
    private widdershins: AnimatedSpriteComponent
    private collider: BoxCollider
    private colliderOffset = new Point(32, 20)
    private dockedPosition: Point
    private atSeaPosition: Point
    private position: Point
    private docked: boolean
    get isDocked() {
        return this.docked
    }
    private get depth() {
        return this.position.y + TILE_SIZE * 3 - 10
    }
    private width = 6

    constructor(dockedPosition: Point, atSeaPosition: Point, docked: boolean) {
        super()
        const colliderOffset = new Point(32, 20)
        this.docked = docked
        this.dockedPosition = dockedPosition
        this.atSeaPosition = atSeaPosition
        this.position = docked ? dockedPosition : atSeaPosition

        const width = 6
    }

    awake() {
        this.widdershins = this.entity.addComponent(
            DudeAnimationUtils.getCharacterIdleAnimation("widdershins").toComponent(
                SpriteTransform.new({
                    depth: this.depth - 1,
                    mirrorX: true,
                })
            )
        )

        this.collider = this.entity.addComponent(new BoxCollider(this.position, new Point(72, 20)))

        // Make the ship bob up and down
        this.entity.addComponent(
            new RepeatedInvoker((_, index) => {
                this.position = this.collider
                    .moveTo(this.position.plus(this.colliderOffset).plusY(index % 2 === 0 ? 1 : -1))
                    .minus(this.colliderOffset)
                return Math.random() * 400 + 600
            })
        )

        // Add water particles
        this.entity.addComponent(
            new RepeatedInvoker(() => {
                for (let i = 0; i < 10; i++) {
                    const size = Math.ceil(Math.random() * 3)
                    Particles.instance.emitParticle(
                        Lists.oneOf([Color.WHITE, Color.BRIGHT_BLUE]),
                        this.position.plus(
                            Lists.oneOf([
                                new Point(35 + Math.random() * 10, 35),
                                new Point(45 + Math.random() * 10, 36),
                                new Point(55 + Math.random() * 10, 38),
                                new Point(65 + Math.random() * 10, 40),
                                new Point(75 + Math.random() * 10, 41),
                                new Point(85 + Math.random() * 10, 41),
                            ])
                        ),
                        this.depth + 5,
                        400,
                        () => Point.ZERO,
                        new Point(size, size)
                    )
                }
                return 150
            })
        )
    }

    private moveToGoal(distanceMultiplier?: number) {
        const goalPos = this.docked ? this.dockedPosition : this.atSeaPosition

        if (goalPos.equals(this.position)) {
            return
        }

        const moveDir = goalPos.minus(this.position)
        const movement = distanceMultiplier
            ? moveDir.normalized().times(distanceMultiplier)
            : moveDir

        this.position = this.collider
            .moveTo(this.position.plus(this.colliderOffset).plus(movement))
            .minus(this.colliderOffset)

        this.widdershins.transform.position = this.position.plus(new Point(50, -10))
    }

    // Move between the at-sea position and the docked position
    update(updateData) {
        this.moveToGoal(updateData.elapsedTimeMillis * 0.005)
    }

    getRenderMethods() {
        const { position, depth } = this
        return [
            Tilesets.instance.largeSprites
                .get(new Point(8, 0), new Point(this.width, 2))
                .toImageRender(SpriteTransform.new({ position, depth: depth - 2 })),
            Tilesets.instance.largeSprites
                .get(new Point(8, 2), new Point(this.width, 3))
                .toImageRender(SpriteTransform.new({ position, depth })),
        ]
    }

    arrive() {
        this.docked = true
    }

    depart() {
        this.docked = false
    }

    simulate(duration: number): void {
        this.moveToGoal()
    }
}
