import { Component } from "../../engine/component"
import { Dude } from "./Dude"
import { UpdateData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { Enemy } from "./Enemy"
import { DudeFactory } from "./DudeFactory"
import { LocationManager } from "../world/LocationManager"
import { Point } from "../../engine/point"
import { WeaponType } from "./weapons/WeaponType"

const SIZE = "s"  // one of [1, 2, 3]

export class ShroomNPC extends Component {
    
    private dude: Dude
    private enemy: Enemy

    awake() {
        this.dude = this.entity.getComponent(Dude)
        this.dude.blob[SIZE] = this.dude.blob[SIZE] || 1

        if (this.dude.blob[SIZE] == 3) {
            this.dude.setWeapon(WeaponType.UNARMED)
            this.enemy = this.entity.addComponent(new Enemy())
        }

        // medium shrooms go aggro if hit, lil guys flee
        this.dude.setOnDamageCallback(() => {
            if (this.dude.blob[SIZE] == 2 && !this.dude.weapon) {
                this.dude.setWeapon(WeaponType.UNARMED)
            }
            if (!this.enemy) {
                this.enemy = this.entity.addComponent(new Enemy())
            }
        })
    }

    update(data: UpdateData) {
        // TODO: grow over time

        if (data.input.isKeyDown(InputKey.J)) {
            this.dude.blob[SIZE] = Math.min(this.dude.blob[SIZE] + 1, 3)

            // overwrite the animation
            const data = this.dude.save()
            data.anim = ShroomNPC.getAnimationName(this.dude.blob)

            // delete and respawn the shroom dude
            this.entity.selfDestruct()
            DudeFactory.instance.load(data, LocationManager.instance.exterior())
        }
    }

    isAggro() {
        return !!this.enemy
    }

    static getAnimationName(blob: object) {
        const size = blob[SIZE] || 1
        return [
            "SmallMushroom",
            "NormalMushroom",
            "LargeMushroom",
        ][size-1]
    }
}