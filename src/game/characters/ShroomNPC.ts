import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { LocationManager } from "../world/LocationManager"
import { Dude } from "./Dude"
import { DudeFactory, DudeType } from "./DudeFactory"
import { Enemy } from "./Enemy"
import { WeaponType } from "./weapons/WeaponType"
import { WorldTime } from "../world/WorldTime"
import { TimeUnit } from "../world/TimeUnit"

const SIZE = "s"  // one of [1, 2, 3]
const NEXT_GROWTH_TIME = "ngt"

export class ShroomNPC extends Component {
    
    private dude: Dude
    private enemy: Enemy

    awake() {
        this.dude = this.entity.getComponent(Dude)
        this.dude.blob[SIZE] = this.dude.blob[SIZE] || 1
        this.dude.blob[NEXT_GROWTH_TIME] = this.dude.blob[NEXT_GROWTH_TIME] || this.nextGrowthTime()

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
        if (WorldTime.instance.time < this.dude.blob[NEXT_GROWTH_TIME]) {
            return
        }

        if (Math.random() > 0.5) {
            // grow
            const size = Math.min(this.dude.blob[SIZE] + 1, 3)
            this.dude.blob[SIZE] = size
            this.dude.blob[NEXT_GROWTH_TIME] = this.nextGrowthTime()

            // overwrite the animation
            const data = this.dude.save()
            data.anim = [
                "SmallMushroom",
                "NormalMushroom",
                "LargeMushroom",
            ][size-1]

            // delete and respawn the shroom dude
            this.entity.selfDestruct()
            DudeFactory.instance.load(data, LocationManager.instance.exterior())
        } else {
            // split
            DudeFactory.instance.new(DudeType.SHROOM, this.dude.position, LocationManager.instance.exterior())
        }
    }

    isAggro() {
        return !!this.enemy
    }

    private nextGrowthTime() {
        // grow every 12-24 hours
        return WorldTime.instance.time + TimeUnit.DAY * (0.5 + Math.random()/2)
    }
}