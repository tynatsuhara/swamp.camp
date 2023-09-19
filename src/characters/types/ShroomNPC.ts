import { Component, UpdateData } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { Item } from "../../items/Item"
import { session } from "../../online/session"
import { TimeUnit } from "../../world/TimeUnit"
import { now } from "../../world/WorldTime"
import { ElementType } from "../../world/elements/ElementType"
import { camp } from "../../world/locations/LocationManager"
import { Dude } from "../Dude"
import { DudeFaction, DudeFactory } from "../DudeFactory"
import { NPC } from "../NPC"
import { WeaponType } from "../weapons/WeaponType"
import { Enemy } from "./Enemy"

const SIZE = "s" // one of [1, 2, 3]
const NEXT_GROWTH_TIME = "ngt"

export class ShroomNPC extends Component {
    private dude: Dude
    private enemy: Enemy
    private npc: NPC

    awake() {
        if (session.isGuest()) {
            return
        }

        this.dude = this.entity.getComponent(Dude)
        this.dude.blob[SIZE] = this.dude.blob[SIZE] || 1
        this.dude.droppedItemSupplier = () => Lists.repeat(this.dude.blob[SIZE], [Item.MUSHROOM])
        this.dude.blob[NEXT_GROWTH_TIME] = this.dude.blob[NEXT_GROWTH_TIME] || this.nextGrowthTime()

        this.npc = this.dude.entity.getComponent(NPC)
        const baseIsEnemyFn = this.npc.isEnemyFn
        this.npc.isEnemyFn = (d) => {
            if (d.factions.includes(DudeFaction.VILLAGERS)) {
                return false
            }
            return baseIsEnemyFn(d)
        }

        // big shrooms are automatically aggro
        if (this.dude.blob[SIZE] == 3) {
            this.dude.setWeapon(WeaponType.UNARMED, -1)
            this.enemy = this.entity.addComponent(new Enemy())
        }

        // medium shrooms go aggro if hit, lil guys flee
        this.dude.setOnDamageCallback((_, attacker) => {
            if (attacker) {
                // NPC will flee until it has a non-NONE weapon
                if (this.dude.blob[SIZE] == 2 && !this.dude.weapon) {
                    this.dude.setWeapon(WeaponType.UNARMED, -1)
                }
                // Adding enemy component will cause them to flee or engage in combat
                if (!this.enemy) {
                    this.enemy = this.entity.addComponent(new Enemy())
                }
            }
        })
    }

    // push back NEXT_GROWTH_TIME to make sure they don't get
    // big and aggressive right when the player respawns
    delayTime(duration: number) {
        if (session.isGuest()) {
            return
        }

        this.dude.blob[NEXT_GROWTH_TIME] += duration
    }

    lateUpdate(updateData: UpdateData) {
        if (session.isGuest()) {
            return
        }

        if (now() >= this.dude.blob[NEXT_GROWTH_TIME]) {
            this.grow()
        } else if (
            this.enemy &&
            !this.npc.targetedEnemy &&
            this.dude.blob[SIZE] < 3 &&
            this.dude.lastDamageTime < now() - 5_000
        ) {
            // recreate the dude entity to reset enemy state
            this.refresh()
        }
    }

    private grow() {
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
        this.refresh(newSize)
    }

    private refresh(size = this.dude.blob[SIZE]) {
        // reset weapon type so shrooms aren't violent on refresh
        this.dude.setWeapon(WeaponType.NONE, -1)

        this.dude.blob[SIZE] = size

        // overwrite the animation
        const newData = this.dude.save()
        newData.anim = ["SmallMushroom", "NormalMushroom", "LargeMushroom"][size - 1]

        const { type, standingPosition, location } = this.dude

        // delete and respawn the shroom dude
        this.entity.selfDestruct()
        DudeFactory.instance.create(type, standingPosition, location, false, newData)
    }

    isAggro() {
        return !!this.enemy && this.dude.blob[SIZE] > 1
    }

    private nextGrowthTime() {
        // grow every 12-24 hours
        return now() + TimeUnit.DAY * (0.5 + Math.random() / 2)
    }
}
