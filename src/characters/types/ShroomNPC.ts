import { Component, UpdateData } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { Item } from "../../items/Items"
import { session } from "../../online/session"
import { ElementType } from "../../world/elements/Elements"
import { camp } from "../../world/locations/LocationManager"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
import { Dude } from "../Dude"
import { DudeFactory } from "../DudeFactory"
import { WeaponType } from "../weapons/WeaponType"
import { Enemy } from "./Enemy"

const SIZE = "s" // one of [1, 2, 3]
const NEXT_GROWTH_TIME = "ngt"

export class ShroomNPC extends Component {
    private dude: Dude
    private enemy: Enemy

    awake() {
        if (session.isGuest()) {
            return
        }

        this.dude = this.entity.getComponent(Dude)
        this.dude.blob[SIZE] = this.dude.blob[SIZE] || 1
        this.dude.droppedItemSupplier = () => Lists.repeat(this.dude.blob[SIZE], [Item.MUSHROOM])
        this.dude.blob[NEXT_GROWTH_TIME] = this.dude.blob[NEXT_GROWTH_TIME] || this.nextGrowthTime()

        if (this.dude.blob[SIZE] == 3) {
            this.dude.setWeapon(WeaponType.UNARMED, -1)
            this.enemy = this.entity.addComponent(new Enemy())
        }

        // medium shrooms go aggro if hit, lil guys flee
        this.dude.setOnDamageCallback(() => {
            // NPC will flee until it has a non-NONE weapon
            if (this.dude.blob[SIZE] == 2 && !this.dude.weapon) {
                this.dude.setWeapon(WeaponType.UNARMED, -1)
            }
            // Adding enemy component will cause them to flee or engage in combat
            if (!this.enemy) {
                this.enemy = this.entity.addComponent(new Enemy())
            }
        })
    }

    // push back NEXT_GROWTH_TIME to make sure they don't get
    // big and aggressive right when the player respawns
    delayTime(duration: number) {
        this.dude.blob[NEXT_GROWTH_TIME] += duration
    }

    lateUpdate(updateData: UpdateData) {
        if (WorldTime.instance.time < this.dude.blob[NEXT_GROWTH_TIME]) {
            return
        }

        const ogSize = this.dude.blob[SIZE]
        this.dude.blob[NEXT_GROWTH_TIME] = this.nextGrowthTime()

        if (ogSize === 3 || Math.random() > 0.5) {
            // spread more shrooms
            const plantedShroom = camp().addElement(ElementType.MUSHROOM, this.dude.tile)
            if (!!plantedShroom) {
                // successfully planted
                return
            }
        }

        // grow
        const newSize = ogSize + 1
        this.dude.blob[SIZE] = newSize

        // overwrite the animation
        const newData = this.dude.save()
        newData.anim = ["SmallMushroom", "NormalMushroom", "LargeMushroom"][newSize - 1]

        // delete and respawn the shroom dude
        this.entity.selfDestruct()
        // MPTODO: This probably won't work online
        DudeFactory.instance.load(newData, camp())
    }

    isAggro() {
        return !!this.enemy && this.dude.blob[SIZE] > 1
    }

    private nextGrowthTime() {
        // grow every 12-24 hours
        return WorldTime.instance.time + TimeUnit.DAY * (0.5 + Math.random() / 2)
    }
}
