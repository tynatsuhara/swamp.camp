import { TileComponent } from "../../engine/tiles/TileComponent"
import { UpdateData, StartData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { Dude } from "./Dude"
import { Interactable } from "../world/elements/Interactable"
import { Hittable } from "../world/elements/Hittable"
import { HUD } from "../ui/HUD"
import { UIStateManager } from "../ui/UIStateManager"
import { Controls } from "../Controls"
import { Lists } from "../../engine/util/Lists"
import { PointLightMaskRenderer } from "../world/PointLightMaskRenderer"
import { TILE_SIZE } from "../graphics/Tilesets"

export class Player extends Component {

    static instance: Player
    
    private crosshairs: TileComponent
    private lerpedLastMoveDir: Point = new Point(1, 0)  // used for crosshair
    private _dude: Dude
    get dude() { return this._dude }

    constructor() {
        super()
        Player.instance = this
        window["player"] = this
    }

    start(startData: StartData) {
        this._dude = this.entity.getComponent(Dude)
    }

    update(updateData: UpdateData) {
        if (!this.dude.isAlive) {
            return
        }

        this.dude.heal(updateData.elapsedTimeMillis/6500)

        // const originalCrosshairPosRelative = this.crosshairs.transform.position.minus(this.position)

        let dx = 0
        let dy = 0

        if (!UIStateManager.instance.isMenuOpen) {
            if (updateData.input.isKeyHeld(InputKey.W)) { dy-- }
            if (updateData.input.isKeyHeld(InputKey.S)) { dy++ }
            if (updateData.input.isKeyHeld(InputKey.A)) { dx-- }
            if (updateData.input.isKeyHeld(InputKey.D)) { dx++ }
        }

        // PointLightMaskRenderer.instance.removeLight(this.dude.standingPosition)

        this.dude.move(
            updateData, 
            new Point(dx, dy), 
            this.dude.weapon.isDrawn() ? updateData.input.mousePos.x - this.dude.standingPosition.x : 0
        )

        // PointLightMaskRenderer.instance.addLight(this.dude.standingPosition, 100)

        if (UIStateManager.instance.isMenuOpen) {
            return
        }

        if (updateData.input.isKeyDown(InputKey.F)) {
            this.dude.weapon.toggleSheathed()
            this.dude.shield.toggleOnBack()
        }

        if (!!this.dude.shield) {
            this.dude.shield.block(updateData.input.isRightMouseHeld)
        }

        if (updateData.input.isMouseDown) {
            this.dude.weapon.attack()
            this.hitResource(updateData)  // TODO: restrict the speed at which you can do this (probably easiest once we introduce tools)
        }

        if (updateData.input.isKeyDown(Controls.interactButton)) {
            this.interact(updateData)
        }



        // FOR TESTING
        if (updateData.input.isKeyDown(InputKey.P)) {
            // this.dude.damage(.25, new Point(Math.random()-.5, Math.random()-.5), 30)
            this.dude.damage(.25, new Point(-1, Math.random()-.5), 30)
        }

        // update crosshair position
        // const relativeLerpedPos = originalCrosshairPosRelative.lerp(0.16, this.lerpedLastMoveDir.normalized().times(TILE_SIZE))
        // this.crosshairs.transform.position = this.position.plus(relativeLerpedPos)
        // const crosshairTilePosition = this.crosshairs.transform.position.plus(new Point(TILE_SIZE, TILE_SIZE).div(2)).floorDiv(TILE_SIZE)

        // if (updateData.input.isKeyDown(InputKey.F)) {
        //     game.tiles.remove(crosshairTilePosition)
        // }

        // if (updateData.input.isKeyDown(InputKey.E)) {
        //     game.tiles.get(crosshairTilePosition)?.getComponent(Interactable)?.interact()
        // }
    }

    private interact(updateData: UpdateData) {
        const interactDistance = 20
        const interactCenter = this.dude.standingPosition.minus(new Point(0, 7))
        const possibilities = updateData.view.entities
                .map(e => e.getComponent(Interactable))
                .filter(e => e?.enabled)
                .filter(e => this.dude.isFacing(e.position))  // interactables the dude is facing
                .filter(e => e.position.distanceTo(interactCenter) < interactDistance)

        Lists.minBy(possibilities, e => e.position.distanceTo(interactCenter))?.interact()
    }

    // for trees and rocks
    private hitResource(updateData: UpdateData) {
        const interactDistance = 20
        const interactCenter = this.dude.standingPosition.minus(new Point(0, 7))
        const possibilities = updateData.view.entities
                .map(e => e.getComponent(Hittable))
                .filter(e => !!e)
                .filter(e => this.dude.isFacing(e.position))
        
        let closestDist = Number.MAX_SAFE_INTEGER
        let closest: Hittable
        for (const i of possibilities) {
            const dist = i.position.distanceTo(interactCenter)
            if (dist < interactDistance && dist < closestDist) {
                closestDist = dist
                closest = i
            }
        }

        closest?.hit(closest.position.minus(interactCenter))
    }
}