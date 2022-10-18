import { Component, Point } from "brigsby/dist"
import { StaticSpriteSource } from "brigsby/dist/sprites"
import { controls } from "../../Controls"
import { Hittable } from "../../world/elements/Hittable"
import { here } from "../../world/locations/LocationManager"
import { Dude } from "../Dude"
import { WeaponType } from "./WeaponType"

// This should be a factor of 90 to make sure we can aim up/down/left/right
export const WEAPON_ROTATION_INCREMENT = 15
export const HAND_POSITION_OFFSET = new Point(-4, -6)

// maps rotation -> { sprite, position (relative offset to the original sprite ) }
export type WeaponSpriteCache = Record<number, { sprite: StaticSpriteSource; position: Point }>

export abstract class Weapon extends Component {
    protected dude: Dude

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    // TODO find a better place for these static functions?
    static getEnemiesInRange(attacker: Dude, attackDistance: number) {
        return here()
            .getDudes()
            .filter((d) => !!d && d !== attacker && d.isEnemy(attacker))
            .filter((d) => attacker.isFacing(d.standingPosition))
            .filter(
                (d) => d.standingPosition.distanceTo(attacker.standingPosition) < attackDistance
            )
    }

    static hitResources(dude: Dude) {
        const interactDistance = 20
        const interactCenter = dude.standingPosition.minus(new Point(0, 7))
        const possibilities = here()
            .getElements()
            .map((e) => e.entity.getComponent(Hittable))
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

        closest?.hit(closest.position.minus(interactCenter))
    }

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

    getPlayerAimingDirection(): Point {
        const mousePos = controls.getWorldSpaceMousePos()
        const centerPos = this.dude.standingPosition.plusY(HAND_POSITION_OFFSET.y)
        return new Point(mousePos.x - centerPos.x, mousePos.y - centerPos.y)
    }

    /**
     * @returns the angle in degrees of the line between the player and the cursor
     */
    getAimingAngle() {
        const { x: xDiff, y: yDiff } = this.getPlayerAimingDirection()
        const degrees = (180 / Math.PI) * Math.atan(yDiff / Math.abs(xDiff))
        const result = Math.round(degrees / WEAPON_ROTATION_INCREMENT) * WEAPON_ROTATION_INCREMENT
        return result
    }

    static initSpriteCache(
        baseSprite: StaticSpriteSource,
        baseSpritePosition: Point,
        rotationPoint: Point
    ): WeaponSpriteCache {
        const cache: WeaponSpriteCache = {}
        const ogCenter = baseSpritePosition.plus(baseSprite.dimensions.floorDiv(2))

        for (let i = -90; i <= 90; i += WEAPON_ROTATION_INCREMENT) {
            if (i === 0) {
                cache[i] = {
                    sprite: baseSprite,
                    position: baseSpritePosition,
                }
            } else {
                const rotatedSprite = baseSprite.rotated(i)
                const centerAfterRotation = ogCenter.rotatedAround(rotationPoint, i)
                cache[i] = {
                    sprite: rotatedSprite,
                    position: centerAfterRotation.minus(rotatedSprite.dimensions.floorDiv(2)),
                }
            }
        }

        return cache
    }
}
