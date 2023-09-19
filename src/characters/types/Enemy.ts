import { Component, debug, Point } from "brigsby/dist"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Item"
import { session } from "../../online/session"
import { Ground } from "../../world/ground/Ground"
import { LightManager } from "../../world/LightManager"
import { now } from "../../world/WorldTime"
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
        if (session.isGuest()) {
            return
        }

        const dude = this.entity.getComponent(Dude)
        const npc = this.entity.getComponent(NPC)

        // Don't overwrite another custom droppedItemSupplier such as one from the shroom class
        if (!dude.droppedItemSupplier) {
            dude.droppedItemSupplier = () => [Item.COIN]
        }

        const shouldIgnoreEnemy = (d: Dude) => {
            // Ignore acquatic creatures
            if (d.factions.includes(DudeFaction.AQUATIC)) {
                return true
            }

            // Only fight a mimic if it is no longer pretending to be a chest
            if (d.type === DudeType.MIMIC) {
                return !d.entity.getComponent(NPC).targetedEnemy
            }

            return false
        }

        npc.isEnemyFn = (d) => {
            if (d.factions.includes(DudeFaction.VILLAGERS)) {
                return !debug.peacefulMode
            }
            // Always attack their last assailant even if they're not normally considered an enemy
            if (d === dude.lastAttacker && now() - dude.lastAttackerTime < 10_000) {
                return true
            }
            // Attack anything that isn't in an overlapping faction
            return d.isEnemy(dude) && !shouldIgnoreEnemy(d)
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
            // Shamans use AOE attacks and will only target players
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

        const isEnemy = npc.isEnemyFn
        // demons only attack enemies in the dark
        npc.isEnemyFn = (d) => isEnemy(d) && LightManager.instance.isDark(d.standingPosition)

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
                    return -1 // end the loop
                }
                lastSunlightCheck = true
            } else {
                lastSunlightCheck = false
            }
            return 1000 + 1000 * Math.random()
        })
    }

    private acquatic(dude: Dude, npc: NPC) {
        const isEnemy = npc.isEnemyFn
        // only attack enemies in the water
        npc.isEnemyFn = (d) =>
            isEnemy(d) &&
            Ground.isWater(d.location.getGround(d.tile)?.type) &&
            Ground.isWater(dude.location.getGround(dude.tile)?.type)

        // npc.pathFindingHeuristic = (pt: Point, goal: Point) => {
        //     const isByLand = [pt.plusX(1), pt.plusX(-1), pt.plusY(1), pt.plusY(-1)].some(
        //         (ptAdjacent) => !Ground.isWater(dude.location.getGround(ptAdjacent)?.type)
        //     )

        //     return pt.distanceTo(goal) + (isByLand ? 5 : 0)
        // }

        // only traverse water
        npc.extraPathIsOccupiedFilter = (pt: Point) => {
            return !Ground.isWater(dude.location.getGround(pt)?.type)
        }
    }
}
