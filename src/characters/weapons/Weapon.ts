import { Component, Point } from "brigsby/dist"
import { pt } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { ImageFilter } from "brigsby/dist/sprites"
import { Hittable } from "../../world/elements/Hittable"
import { here } from "../../world/locations/LocationManager"
import { Dude } from "../Dude"
import { NPC } from "../NPC"
import { WeaponType } from "./WeaponType"

// This should be a factor of 90 to make sure we can aim up/down/left/right
export const WEAPON_ROTATION_INCREMENT = 15
export const HAND_POSITION_OFFSET = new Point(-4, -6)

export abstract class Weapon extends Component {
    protected dude: Dude

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    /**
     * @returns enemies in attacking range of the given attacker, sorted by increasing distance
     */
    static getEnemiesInRange(attacker: Dude, attackDistance: number) {
        return here()
            .getDudes()
            .filter((d) => !!d && d !== attacker && d.isEnemy(attacker))
            .filter((d) => attacker.isFacing(d.standingPosition))
            .map((dude) => ({
                dude,
                dist: dude.standingPosition.distanceTo(attacker.standingPosition),
            }))
            .filter(({ dist }) => dist < attackDistance)
            .sort((a, b) => a.dist - b.dist)
            .map(({ dude }) => dude)
    }

    // Called on host and client
    static hitResources(dude: Dude) {
        const npc = dude.entity.getComponent(NPC)

        const interactDistance = npc ? 30 : 20
        const interactCenter = dude.standingPosition.minus(new Point(0, 7))
        const elements = npc?.getInteractWithGoal()
            ? [npc.getInteractWithElement()]
            : here().getElements()
        const possibilities = elements
            .map((e) => e?.entity?.getComponent(Hittable))
            .filter((e) => !!e)
            .filter((e) => dude.isFacing(e.position))

        let closestDist = Number.MAX_SAFE_INTEGER
        let closest: Hittable
        for (const i of possibilities) {
            const dist = i.position.distanceTo(interactCenter)
            if (dist < interactDistance + i.extraRange && dist < closestDist) {
                closestDist = dist
                closest = i
            }
        }

        closest?.hit(closest.position.minus(interactCenter), dude)
    }

    /**
     * Weapons should implement this method instead of getRenderMethods
     */
    abstract getWrappedRenderMethods(filter: ImageFilter): RenderMethod[]

    abstract getType(): WeaponType

    /**
     * Used to determine if a shield can block
     */
    abstract isAttacking(): boolean
    abstract setSheathed(sheathed: boolean): void
    abstract isSheathed(): boolean
    abstract getRange(): number

    /**
     * This is the minimum distance that NPCs using this weapon will want to be from their target.
     * Melee weapons should return 0.
     */
    getStoppingDistance() {
        return 0
    }

    getMillisBetweenAttacks() {
        return 1000
    }

    /**
     * This can be called every single frame and should handle that appropriately
     * @param newAttack should be true if this is a new attack, false otherwise
     * (this is useful for weapons that involve charging up, such as the spear)
     */
    abstract attack(newAttack: boolean)

    /**
     * This will be called on any frame that attack() is not called
     */
    cancelAttack() {}

    /**
     * @returns d diff and y diff from the player "hand" point
     */
    getAimingDirection(): Point {
        const { x, y } = this.dude.aimingDirection
        return pt(x, y)
    }

    /**
     * @returns the angle in degrees of the line between the player and the cursor
     */
    getAimingAngle() {
        const { x: xDiff, y: yDiff } = this.getAimingDirection()
        const degrees = (180 / Math.PI) * Math.atan(yDiff / Math.abs(xDiff))
        const result = Math.round(degrees / WEAPON_ROTATION_INCREMENT) * WEAPON_ROTATION_INCREMENT
        return result
    }
}

export type ReadOnlyWeapon = Omit<Weapon, "attack" | "setSheathed" | "cancelAttack">
