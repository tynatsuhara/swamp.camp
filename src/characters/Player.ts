import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { UpdateData } from "brigsby/dist/Engine"
import { InputKey } from "brigsby/dist/Input"
import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { Controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { PlaceElementDisplay } from "../ui/PlaceElementDisplay"
import { UIStateManager } from "../ui/UIStateManager"
import { Interactable } from "../world/elements/Interactable"
import { Dude } from "./Dude"

export class Player extends Component {
    static instance: Player

    private rollingMomentum: Point
    private _velocity: Point = Point.ZERO
    get velocity() {
        return this._velocity
    }
    private _dude: Dude
    get dude() {
        return this._dude
    }

    constructor() {
        super()
        Player.instance = this
    }

    awake() {
        this._dude = this.entity.getComponent(Dude)
        this.dude.setOnDamageCallback((blocked) => {
            if (!this.dude.isAlive) {
                Camera.instance.shake(6, 600)
            } else if (blocked) {
                Camera.instance.shake(2.5, 400)
            } else {
                Camera.instance.shake(3.5, 400)
            }
        })
        this.dude.droppedItemSupplier = () => []
    }

    update(updateData: UpdateData) {
        if (!this.dude.isAlive) {
            return
        }

        // TODO: Should we remove auto-healing?
        this.dude.heal(updateData.elapsedTimeMillis / 6500)
        const possibleInteractable = this.updateInteractables(updateData)

        let dx = 0
        let dy = 0

        if (this.dude.rolling) {
            // TODO: change how momentum works if we implement slippery ice
            dx = this.rollingMomentum.x
            dy = this.rollingMomentum.y
        } else if (!UIStateManager.instance.isMenuOpen || PlaceElementDisplay.instance.isOpen) {
            if (updateData.input.isKeyHeld(Controls.walkUp)) {
                dy--
            }
            if (updateData.input.isKeyHeld(Controls.walkDown)) {
                dy++
            }
            if (updateData.input.isKeyHeld(Controls.walkLeft)) {
                dx--
            }
            if (updateData.input.isKeyHeld(Controls.walkRight)) {
                dx++
            }
        }

        let speed = 1
        if (this.dude.rolling) {
            speed += 1.5
        }
        if (this.dude.shield?.isBlocking()) {
            speed -= 0.4
        }

        speed *= debug.speedMultiplier

        this._velocity = new Point(dx, dy)

        this.dude.move(
            updateData,
            this.velocity,
            this.dude.rolling ? 0 : updateData.input.mousePos.x - this.dude.standingPosition.x,
            speed
        )

        if (UIStateManager.instance.isMenuOpen) {
            return
        }

        if (!this.dude.jumping && updateData.input.isKeyDown(InputKey.SPACE)) {
            this.dude.jump()
        } else if (
            !this.dude.rolling &&
            updateData.input.isKeyDown(InputKey.C) &&
            (dx !== 0 || dy !== 0)
        ) {
            this.dude.roll()
            this.rollingMomentum = new Point(dx, dy)
        }

        if (updateData.input.isKeyDown(InputKey.F)) {
            // todo: these could get out of sync if one is null
            this.dude.weapon.toggleSheathed()
            this.dude.shield.toggleOnBack()
        }

        let blocking = false
        if (!!this.dude.shield) {
            blocking =
                updateData.input.isRightMouseHeld || updateData.input.isKeyHeld(Controls.blockKey)
            this.dude.shield.block(blocking)
        }

        if (updateData.input.isMouseHeld && !blocking) {
            this.dude.weapon?.attack(updateData.input.isMouseDown)
        } else {
            this.dude.weapon?.cancelAttack()
        }

        if (updateData.input.isKeyDown(Controls.interactButton) && !!possibleInteractable) {
            possibleInteractable.interact()
        }
    }

    private updateInteractables(updateData: UpdateData) {
        const interactDistance = 20
        const interactCenter = this.dude.standingPosition.minus(new Point(0, 7))
        const interactables = updateData.view.entities
            .map((e) => e.getComponent(Interactable))
            .filter((e) => e?.enabled)
        interactables.forEach((i) => i.updateIndicator(false))

        const possibilities = interactables
            .filter((e) => this.dude.isFacing(e.position)) // interactables the dude is facing
            .filter((e) => e.position.distanceTo(interactCenter) < interactDistance)
            .filter((e) => e.isInteractable())

        const i = Lists.minBy(possibilities, (e) => e.position.distanceTo(interactCenter))
        if (!!i) {
            i.updateIndicator(true)
        }
        return i
    }
}
