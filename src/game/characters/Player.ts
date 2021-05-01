import { Component } from "../../engine/component"
import { debug } from "../../engine/debug"
import { StartData, UpdateData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { Point } from "../../engine/point"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Lists } from "../../engine/util/Lists"
import { StepSounds } from "../audio/StepSounds"
import { Controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { pixelPtToTilePt } from "../graphics/Tilesets"
import { NotificationDisplay } from "../ui/NotificationDisplay"
import { PlaceElementDisplay } from "../ui/PlaceElementDisplay"
import { UIStateManager } from "../ui/UIStateManager"
import { ElementType } from "../world/elements/Elements"
import { Interactable } from "../world/elements/Interactable"
import { LocationManager } from "../world/LocationManager"
import { Dude } from "./Dude"
import { DudeFactory, DudeType } from "./DudeFactory"

export class Player extends Component {

    static instance: Player
    
    private crosshairs: TileComponent
    private lerpedLastMoveDir: Point = new Point(1, 0)  // used for crosshair
    private rollingMomentum: Point
    private _dude: Dude
    get dude() { return this._dude }

    private footstep: HTMLAudioElement

    constructor() {
        super()
        Player.instance = this

        StepSounds.startFootstepSoundLoop()
    }


    start(startData: StartData) {
        this._dude = this.entity.getComponent(Dude)
        this.dude.setOnDamageCallback(blocked => {
            if (!this.dude.isAlive) {
                Camera.instance.shake(6, 600) 
            } else if (blocked) {
                Camera.instance.shake(2.5, 400) 
            } else {
                Camera.instance.shake(3.5, 400) 
            }
        })
    }

    update(updateData: UpdateData) {
        if (!this.dude.isAlive) {
            return
        }

        this.dude.heal(updateData.elapsedTimeMillis/6500)
        const possibleInteractable = this.updateInteractables(updateData)

        // const originalCrosshairPosRelative = this.crosshairs.transform.position.minus(this.position)

        let dx = 0
        let dy = 0

        if (this.dude.rolling()) {
            // TODO: change how momentum works if we implement slippery ice
            dx = this.rollingMomentum.x
            dy = this.rollingMomentum.y
        } else if (!UIStateManager.instance.isMenuOpen || PlaceElementDisplay.instance.isOpen) {
            if (updateData.input.isKeyHeld(Controls.walkUp)) { dy-- }
            if (updateData.input.isKeyHeld(Controls.walkDown)) { dy++ }
            if (updateData.input.isKeyHeld(Controls.walkLeft)) { dx-- }
            if (updateData.input.isKeyHeld(Controls.walkRight)) { dx++ }
        }

        let speed = 1
        if (this.dude.rolling()) {
            speed += 1.5
        }
        if (this.dude.shield?.isBlocking()) {
            speed -= 0.4
        }

        this.dude.move(
            updateData, 
            new Point(dx, dy), 
            0, // this.dude.rolling() ? 0 : updateData.input.mousePos.x - this.dude.standingPosition.x,
            speed
        )

        if (UIStateManager.instance.isMenuOpen) {
            return
        }

        // const rollingBackwards = (dx > 0 && updateData.input.mousePos.x < this.dude.standingPosition.x)
                // || (dx < 0 && updateData.input.mousePos.x > this.dude.standingPosition.x)

        if (!this.dude.rolling() && updateData.input.isKeyDown(InputKey.SPACE) && (dx !== 0 || dy !== 0)) {
                // && !rollingBackwards) {
            this.dude.roll()
            this.rollingMomentum = new Point(dx, dy)
        }

        if (updateData.input.isKeyDown(InputKey.F)) {
            this.dude.weapon.toggleSheathed()
            this.dude.shield.toggleOnBack()
        }

        if (!!this.dude.shield) {
            this.dude.shield.block(updateData.input.isKeyHeld(Controls.blockKey))
        }

        if (updateData.input.isKeyHeld(Controls.attackKey) && !updateData.input.isKeyHeld(Controls.blockKey)) {
            this.dude.weapon.attack(updateData.input.isKeyDown(Controls.attackKey))
        } else {
            this.dude.weapon.cancelAttack()
        }

        if (updateData.input.isKeyDown(Controls.interactButton) && !!possibleInteractable) {
            possibleInteractable.interact()
        }

        // Commands which are used for testing and development
        if (debug.enableDevControls) {
            const mouseTilePos = pixelPtToTilePt(updateData.input.mousePos)
            if (updateData.input.isKeyDown(InputKey.O)) {
                DudeFactory.instance.new(DudeType.ORC_WARRIOR, updateData.input.mousePos)
            }
            if (updateData.input.isKeyDown(InputKey.P)) {
                DudeFactory.instance.new(DudeType.HORNED_DEMON, updateData.input.mousePos)
            }
            if (updateData.input.isKeyDown(InputKey.SEMICOLON)) {
                DudeFactory.instance.new(DudeType.SHROOM, updateData.input.mousePos)
            }
            if (updateData.input.isKeyDown(InputKey.QUOTE)) {
                NotificationDisplay.instance.push({
                    text: "ORC ATTACK!",
                    icon: "sword",
                })
            }
            if (updateData.input.isKeyDown(InputKey.COMMA)) {
                LocationManager.instance.currentLocation.addElement(ElementType.CHEST, mouseTilePos)
            }
            if (updateData.input.isKeyDown(InputKey.PERIOD)) {
                LocationManager.instance.currentLocation.removeElementAt(mouseTilePos)
            }
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

    private updateInteractables(updateData: UpdateData) {
        const interactDistance = 20
        const interactCenter = this.dude.standingPosition.minus(new Point(0, 7))
        const interactables = updateData.view.entities
                .map(e => e.getComponent(Interactable))
                .filter(e => e?.enabled)
        interactables.forEach(i => i.updateIndicator(false))

        const possibilities = interactables
                .filter(e => this.dude.isFacing(e.position))  // interactables the dude is facing
                .filter(e => e.position.distanceTo(interactCenter) < interactDistance)
                .filter(e => e.isInteractable())

        const i = Lists.minBy(possibilities, e => e.position.distanceTo(interactCenter))
        if (!!i) {
            i.updateIndicator(true)
        }
        return i
    }
}