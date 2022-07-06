import { Component, debug, Point } from "brigsby/dist"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { Ground } from "../../world/ground/Ground"
import { LightManager } from "../../world/LightManager"
import { WorldTime } from "../../world/WorldTime"
import { Condition } from "../Condition"
import { Dude } from "../Dude"
import { DudeFaction } from "../DudeFactory"
import { DudeType } from "../DudeType"
import { NPC } from "../NPC"

/**
 * Something that probably wants to eat the player
 */
export class Enemy extends Component {
    awake() {
        const dude = this.entity.getComponent(Dude)
        const npc = this.entity.getComponent(NPC)

        // Don't overwrite another custom droppedItemSupplier such as one from the shroom class
        if (!dude.droppedItemSupplier) {
            dude.droppedItemSupplier = () => [Item.COIN]
        }

        npc.isEnemyFn = (d) => {
            // Default land enemy behavior is to attack anything that isn't in an overlapping faction
            return (
                !debug.peacefulMode &&
                ((d.isEnemy(dude) && !d.factions.includes(DudeFaction.AQUATIC)) ||
                    // Always attack their last assailant even if they're not normally considered an enemy
                    (d === dude.lastAttacker &&
                        WorldTime.instance.time - dude.lastAttackerTime < 10_000))
            )
        }

        if (dude.factions.includes(DudeFaction.ORCS)) {
            this.orc(dude, npc)
        } else if (dude.factions.includes(DudeFaction.DEMONS)) {
            this.demon(dude, npc)
        } else if (dude.factions.includes(DudeFaction.AQUATIC)) {
            this.acquatic(dude, npc)
        }
    }

    private orc(dude: Dude, npc: NPC) {
        // Orcs only show up to siege, so they will find you wherever you're hiding
        npc.findTargetRange = Number.MAX_SAFE_INTEGER

        if (dude.type === DudeType.ORC_SHAMAN) {
            // Shamans use AOE attacks and will only target the player
            npc.enemyToAttackFilterFn = (enemies) => {
                return enemies.filter((e) => e.type === DudeType.PLAYER)
            }
        } else {
            // Only attack armed enemies if they are close enough to be dangerous, otherwise target the weak
            npc.enemyToAttackFilterFn = (enemies) => {
                const nearbyArmedEnemies = enemies.filter(
                    (d) =>
                        !!d.weapon &&
                        d.standingPosition.manhattanDistanceTo(dude.standingPosition) < 100
                )
                return nearbyArmedEnemies.length > 0 ? nearbyArmedEnemies : enemies
            }
        }
    }

    private demon(dude: Dude, npc: NPC) {
        npc.findTargetRange *= 3

        // demons only attack enemies in the dark
        npc.isEnemyFn = (d) => {
            return (
                !d.factions.includes(DudeFaction.DEMONS) &&
                !d.factions.includes(DudeFaction.AQUATIC) &&
                LightManager.instance.isDark(d.standingPosition)
            )
        }

        // demons only attack roam in the dark
        npc.pathFindingHeuristic = (pt: Point, goal: Point) => {
            return (
                pt.distanceTo(goal) + (LightManager.instance.isDark(pt.times(TILE_SIZE)) ? 0 : 100)
            )
        }

        // dissolve if they end up in the light for too long
        let lastSunlightCheck = false
        dude.doWhileLiving(() => {
            if (!LightManager.instance.isDark(dude.standingPosition)) {
                if (lastSunlightCheck) {
                    // they've been in sunlight for a while, time to die
                    dude.dissolve()
                    dude.addCondition(Condition.ON_FIRE, 10_000)
                    return true // end the loop
                }
                lastSunlightCheck = true
            } else {
                lastSunlightCheck = false
            }
        }, 1000 + 1000 * Math.random())
    }

    private acquatic(dude: Dude, npc: NPC) {
        // only attack enemies in the water
        npc.isEnemyFn = (d) => {
            return (
                !d.factions.includes(DudeFaction.AQUATIC) &&
                Ground.isWater(d.location.getGround(d.tile)?.type) &&
                Ground.isWater(dude.location.getGround(dude.tile)?.type)
            )
        }

        // npc.pathFindingHeuristic = (pt: Point, goal: Point) => {
        //     const isByLand = [pt.plusX(1), pt.plusX(-1), pt.plusY(1), pt.plusY(-1)].some(
        //         (ptAdjacent) => !Ground.isWater(dude.location.getGround(ptAdjacent)?.type)
        //     )

        //     return pt.distanceTo(goal) + (isByLand ? 5 : 0)
        // }

        // only traverse water
        npc.pathIsOccupied = (pt: Point) => {
            return !Ground.isWater(dude.location.getGround(pt)?.type)
        }
    }
}
