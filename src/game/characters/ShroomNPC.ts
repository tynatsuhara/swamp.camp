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
            // NPC will flee until it has a non-NONE weapon
            if (this.dude.blob[SIZE] == 2 && !this.dude.weapon) {
                this.dude.setWeapon(WeaponType.UNARMED)
            }
            // Adding enemy component will cause them to flee or engage in combat
            if (!this.enemy) {
                this.enemy = this.entity.addComponent(new Enemy())
            }
        })
    }

    update(data: UpdateData) {
        if (WorldTime.instance.time < this.dude.blob[NEXT_GROWTH_TIME]) {
            return
        }

        const ogSize = this.dude.blob[SIZE]
        this.dude.blob[NEXT_GROWTH_TIME] = this.nextGrowthTime()

        if (ogSize === 3 || Math.random() > 0.5) {
            // split
            DudeFactory.instance.new(DudeType.SHROOM, this.dude.position, LocationManager.instance.exterior())
        } else {
            // grow
            const newSize = ogSize + 1
            this.dude.blob[SIZE] = newSize

            // overwrite the animation
            const data = this.dude.save()
            data.anim = ["SmallMushroom", "NormalMushroom", "LargeMushroom",][newSize-1]

            // delete and respawn the shroom dude
            this.entity.selfDestruct()
            DudeFactory.instance.load(data, LocationManager.instance.exterior())
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