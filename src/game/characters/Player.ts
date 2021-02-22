import { Component } from "../../engine/component"
import { debug } from "../../engine/debug"
import { StartData, UpdateData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { Point } from "../../engine/point"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Lists } from "../../engine/util/Lists"
import { Controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { pixelPtToTilePt } from "../graphics/Tilesets"
import { NotificationDisplay } from "../ui/NotificationDisplay"
import { UIStateManager } from "../ui/UIStateManager"
import { ElementType } from "../world/elements/Elements"
import { Interactable } from "../world/elements/Interactable"
import { LocationManager } from "../world/LocationManager"
import { TownStats } from "../world/TownStats"
import { Dude } from "./Dude"
import { DudeFactory, DudeType } from "./DudeFactory"

export class Player extends Component {

    static instance: Player
    
    private crosshairs: TileComponent
    private lerpedLastMoveDir: Point = new Point(1, 0)  // used for crosshair
    private _dude: Dude
    get dude() { return this._dude }

    constructor() {
        super()
        Player.instance = this
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

        if (!UIStateManager.instance.isMenuOpen) {
            if (updateData.input.isKeyHeld(InputKey.W)) { dy-- }
            if (updateData.input.isKeyHeld(InputKey.S)) { dy++ }
            if (updateData.input.isKeyHeld(InputKey.A)) { dx-- }
            if (updateData.input.isKeyHeld(InputKey.D)) { dx++ }
        }

        // TODO: - make this an unlockable feature
        //       - instead of removing by position, map the light to a source object and remove based on that
        // const lightPosOffset = -TILE_SIZE/2
        // PointLightMaskRenderer.instance.removeLight(LocationManager.instance.currentLocation, this.dude.standingPosition.plusY(lightPosOffset))

        this.dude.move(
            updateData, 
            new Point(dx, dy), 
            0, // this.dude.rolling() ? 0 : updateData.input.mousePos.x - this.dude.standingPosition.x,
            1 + (this.dude.rolling() ? 1.2 : 0)
        )

        // PointLightMaskRenderer.instance.addLight(LocationManager.instance.currentLocation, this.dude.standingPosition.plusY(lightPosOffset), 100)

        if (UIStateManager.instance.isMenuOpen) {
            return
        }

        // const rollingBackwards = (dx > 0 && updateData.input.mousePos.x < this.dude.standingPosition.x)
                // || (dx < 0 && updateData.input.mousePos.x > this.dude.standingPosition.x)

        if (updateData.input.isKeyDown(InputKey.SPACE) && (dx !== 0 || dy !== 0)) {
                // && !rollingBackwards) {
            this.dude.roll()
        }

        if (updateData.input.isKeyDown(InputKey.F)) {
            this.dude.weapon.toggleSheathed()
            this.dude.shield.toggleOnBack()
        }

        if (!!this.dude.shield) {
            this.dude.shield.block(updateData.input.isRightMouseHeld)
        }

        if (updateData.input.isMouseHeld) {
            this.dude.weapon.attack(updateData.input.isMouseDown)
        } else {
            this.dude.weapon.cancelAttack()
        }

        if (updateData.input.isKeyDown(Controls.interactButton) && !!possibleInteractable) {
            possibleInteractable.interact()
        }

        // Commands which are used for testing and development
        if (debug.enableDevControls) {
            const mouseTilePos = pixelPtToTilePt(updateData.input.mousePos)
            if (updateData.input.isKeyDown(InputKey.K)) {
                DudeFactory.instance.new(DudeType.ORC_WARRIOR, updateData.input.mousePos)
            }
            if (updateData.input.isKeyDown(InputKey.L)) {
                DudeFactory.instance.new(DudeType.HORNED_DEMON, updateData.input.mousePos)
            }
            if (updateData.input.isKeyDown(InputKey.SEMICOLON)) {
                DudeFactory.instance.new(DudeType.ORC_WARRIOR, updateData.input.mousePos)
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