import { TileComponent } from "../../engine/tiles/TileComponent"
import { UpdateData, StartData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { Dude } from "./Dude"
import { Interactable } from "../interact/Interactable"

export class Player extends Component {

    static instance: Player
    
    private crosshairs: TileComponent
    private lerpedLastMoveDir: Point = new Point(1, 0)  // used for crosshair
    private dude: Dude

    constructor() {
        super()
        Player.instance = this
    }

    start(startData: StartData) {
        this.dude = this.entity.getComponent(Dude)
    }

    update(updateData: UpdateData) {
        if (!this.dude.isAlive) {
            return
        }
        // const originalCrosshairPosRelative = this.crosshairs.transform.position.minus(this.position)

        let dx = 0
        let dy = 0

        if (updateData.input.isKeyHeld(InputKey.W)) { dy-- }
        if (updateData.input.isKeyHeld(InputKey.S)) { dy++ }
        if (updateData.input.isKeyHeld(InputKey.A)) { dx-- }
        if (updateData.input.isKeyHeld(InputKey.D)) { dx++ }

        this.dude.move(
            updateData, 
            new Point(dx, dy), 
            this.dude.weapon.isDrawn() ? updateData.input.mousePos.x - this.dude.standingPosition.x : 0
        )

        if (updateData.input.isKeyDown(InputKey.F)) {
            this.dude.weapon.toggleSheathed()
        }

        if (updateData.input.isMouseDown) {
            this.dude.weapon.attack()
        }

        if (updateData.input.isKeyDown(InputKey.E)) {
            this.interact(updateData)
        }

        // FOR TESTING
        if (updateData.input.isKeyDown(InputKey.P)) {
            this.dude.damage(.25, new Point(Math.random()-.5, Math.random()-.5), 30)
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
        const interactCenter = this.dude.standingPosition.minus(new Point(0, 5))
        const possibilities = updateData.view.entities
                .map(e => e.getComponent(Interactable))
                .filter(e => !!e)
                .filter(e => this.dude.animation.transform.mirrorX === (e.position.x < interactCenter.x))  // interactables the dude is facing
        
        let closestDist = Number.MAX_SAFE_INTEGER
        let closest: Interactable
        for (const i of possibilities) {
            const dist = i.position.distanceTo(interactCenter)
            if (dist < interactDistance && dist < closestDist) {
                closestDist = dist
                closest = i
            }
        }

        closest?.interact()
    }
}