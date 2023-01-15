import { Entity, Point, pt, UpdateData } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { AnimatedSpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Lists, RepeatedInvoker } from "brigsby/dist/util"
import { Dude } from "../../characters/Dude"
import { DudeAnimationUtils } from "../../characters/DudeAnimationUtils"
import { DudeType } from "../../characters/DudeType"
import { NPC } from "../../characters/NPC"
import { Particles } from "../../graphics/particles/Particles"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Color } from "../../ui/Color"
import { Location } from "../locations/Location"
import { Simulatable } from "../Simulatable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"

type QueequegData = {
    docked: boolean
    passengers: string[]
}

export class QueequegFactory extends ElementFactory<ElementType.QUEEQUEG> {
    dimensions = pt(6, 3)

    constructor() {
        super(ElementType.QUEEQUEG)
    }

    make(wl: Location, pos: Point, data: QueequegData): ElementComponent<ElementType.QUEEQUEG> {
        const e = new Entity()

        const dockedPositionX = pos.x * TILE_SIZE + 1
        const atSeaPositionX = dockedPositionX + TILE_SIZE * 7
        const positionY = pos.y * TILE_SIZE

        const ship = e.addComponent(
            new Queequeg(
                pos,
                dockedPositionX,
                atSeaPositionX,
                positionY,
                data.docked ?? false,
                data.passengers ?? [],
                wl
            )
        )
        window["queequeg"] = ship

        return e.addComponent(new ElementComponent(this.type, pos, ship.save))
    }
}

export class Queequeg extends Simulatable {
    static instance: Queequeg

    private widdershins: AnimatedSpriteComponent
    private collider: BoxCollider
    private colliderOffset = pt(32, 20)
    private dockedPositionX: number
    private atSeaPositionX: number
    private position: Point
    private docked: boolean
    private get depth() {
        return this.position.y + TILE_SIZE * 3 - 10
    }
    private width = 6
    private passengers: Dude[] = []

    // where NPCs should walk to
    readonly entryTile: Point

    constructor(
        tilePoint: Point,
        dockedPositionX: number,
        atSeaPositionX: number,
        positionY: number,
        docked: boolean,
        passengers: string[],
        wl: Location
    ) {
        super()
        this.entryTile = tilePoint.plus(pt(4, 2))

        this.dockedPositionX = dockedPositionX
        this.atSeaPositionX = atSeaPositionX
        this.docked = docked

        this.position = pt(docked ? dockedPositionX : atSeaPositionX, positionY)

        this.start = () => {
            passengers.map((uuid) => Dude.get(uuid)).forEach((dude) => this.pushPassenger(dude))
        }

        Queequeg.instance = this
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

        this.collider = this.entity.addComponent(new BoxCollider(this.position, pt(72, 20)))

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
                        Lists.oneOf([Color.WHITE, Color.BLUE_6]),
                        this.position.plus(
                            Lists.oneOf([
                                pt(35 + Math.random() * 10, 35),
                                pt(45 + Math.random() * 10, 36),
                                pt(55 + Math.random() * 10, 38),
                                pt(65 + Math.random() * 10, 40),
                                pt(75 + Math.random() * 10, 41),
                                pt(85 + Math.random() * 10, 41),
                            ])
                        ),
                        this.depth + 5,
                        400,
                        () => Point.ZERO,
                        pt(size, size)
                    )
                }
                return 150
            })
        )
    }

    private moveToGoal(elapsedTimeMillis?: number) {
        const goalPosX = this.docked ? this.dockedPositionX : this.atSeaPositionX

        if (goalPosX !== this.position.x) {
            const fullDistanceMovementX = goalPosX - this.position.x

            let movementX: number

            if (!elapsedTimeMillis) {
                movementX = fullDistanceMovementX
            } else if (this.docked) {
                // lerp in
                movementX = fullDistanceMovementX * 0.0012 * elapsedTimeMillis
            } else {
                // constant speed move out
                movementX = Math.min(elapsedTimeMillis * 0.01, fullDistanceMovementX)
            }

            this.position = this.collider
                .moveTo(this.position.plus(this.colliderOffset).plusX(movementX))
                .minus(this.colliderOffset)
        }

        this.widdershins.transform.position = this.position.plus(pt(52, -13))

        // the boat can only fit {positionsByIndex.length} passengers
        const positionsByIndex = [pt(25, 5), pt(35, 0), pt(45, 3)]

        this.passengers.forEach((p, i) => {
            if (i >= positionsByIndex.length) {
                throw new Error("too many passengers in the ship")
            }
            const pos = this.widdershins.transform.position
                .plusY(this.widdershins.transform.dimensions.y)
                .plus(positionsByIndex[i])
            p.manualDepth = this.depth
            p.moveTo(pos, true)
            p.move(0, Point.ZERO, -1)
        })
    }

    // Move between the at-sea position and the docked position
    update({ elapsedTimeMillis }: UpdateData) {
        this.moveToGoal(elapsedTimeMillis)
    }

    getRenderMethods() {
        const { position, depth } = this
        return [
            Tilesets.instance.largeSprites
                .get(pt(8, 0), pt(this.width, 2))
                .toImageRender(SpriteTransform.new({ position, depth: depth - 2 })),
            Tilesets.instance.largeSprites
                .get(pt(8, 2), pt(this.width, 3))
                .toImageRender(SpriteTransform.new({ position, depth: depth + 2 })),
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

    pushPassenger(dude: Dude) {
        if (!dude) {
            return
        }
        this.passengers.push(dude)
        if (dude.type !== DudeType.PLAYER) {
            // don't worry about any NPC logic right now
            dude.entity.getComponent(NPC).enabled = false
        }
    }

    getPassengers() {
        return this.passengers
    }

    removePassenger(dude: Dude) {
        if (!this.passengers.includes(dude)) {
            console.error(`${DudeType[dude.type]} ${dude.uuid} is not on the ship`)
        } else {
            console.log(`${DudeType[dude.type]} ${dude.uuid} got off the ship`)
        }
        this.passengers = this.passengers.filter((p) => p !== dude)
        const pos = dude.standingPosition.plusY(24)
        dude.moveTo(pos, true)
        dude.manualDepth = undefined
        if (dude.type !== DudeType.PLAYER) {
            dude.entity.getComponent(NPC).enabled = true
        }
    }

    save = (): QueequegData => ({
        docked: this.docked,
        passengers: this.passengers.map((p) => p.uuid),
    })
}
