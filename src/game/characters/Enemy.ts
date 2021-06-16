import { Component } from "../../engine/Component"
import { Point } from "../../engine/Point"
import { TILE_SIZE } from "../graphics/Tilesets"
import { LightManager } from "../world/LightManager"
import { Dude } from "./Dude"
import { DudeFaction, DudeType } from "./DudeFactory"
import { NPC } from "./NPC"

/**
 * Something that probably wants to eat the player
 */
export class Enemy extends Component {

    private dude: Dude
    private npc: NPC

    awake() {
        this.dude = this.entity.getComponent(Dude)
        this.npc = this.entity.getComponent(NPC)

        if (this.dude.factions.includes(DudeFaction.ORCS)) {
            // Orcs only show up to siege, so they will find you wherever you're hiding
            this.npc.findTargetRange = Number.MAX_SAFE_INTEGER
            if (this.dude.type === DudeType.ORC_SHAMAN) {
                this.npc.enemyFilterFn = (enemies) => {
                    // Shamans use AOE attacks and will only target the player
                    return enemies.filter(e => e.type === DudeType.PLAYER)
                }
            } else {
                this.npc.enemyFilterFn = (enemies) => {
                    // Only attack armed enemies if they are close enough to be dangerous, otherwise target the weak
                    const nearbyArmedEnemies = enemies.filter(d => !!d.weapon && d.standingPosition.manhattanDistanceTo(this.dude.standingPosition) < 100)
                    return nearbyArmedEnemies.length > 0 ? nearbyArmedEnemies : enemies
                }
            }
        }

        // TODO: Consider splitting this class up 
        if (this.dude.factions.includes(DudeFaction.DEMONS)) {
            // DEMON enemies will avoid light
            this.npc.isEnemyFn = d => {
                return !d.factions.includes(DudeFaction.DEMONS) && LightManager.instance.isDark(d.standingPosition)
            }
            this.npc.pathFindingHeuristic = (pt: Point, goal: Point) => {
                return pt.distanceTo(goal) + (LightManager.instance.isDark(pt.times(TILE_SIZE)) ? 0 : 100)
            }
            this.npc.findTargetRange *= 3
            // dissolve if they end up in the light for too long
            let lastSunlightCheck = false
            this.npc.doWhileLiving(() => {
                if (!LightManager.instance.isDark(this.dude.standingPosition)) {
                    if (lastSunlightCheck) {  // they've been in sunlight for a while, time to die
                        this.dude.dissolve()
                        return true // end the loop
                    }
                    lastSunlightCheck = true
                } else {
                    lastSunlightCheck = false
                }
            }, 1000 + 1000 * Math.random())
        } else {
            this.npc.isEnemyFn = d => d.isEnemy(this.dude)
        }
    }
}