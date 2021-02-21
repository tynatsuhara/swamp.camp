import { Component } from "../../engine/component"
import { Point } from "../../engine/point"
import { TILE_SIZE } from "../graphics/Tilesets"
import { OutdoorDarknessMask } from "../world/OutdoorDarknessMask"
import { Dude } from "./Dude"
import { DudeFaction } from "./DudeFactory"
import { NPC } from "./NPC"

export class Enemy extends Component {

    private dude: Dude
    private npc: NPC

    awake() {
        this.dude = this.entity.getComponent(Dude)
        this.npc = this.entity.getComponent(NPC)

        if (this.dude.factions.includes(DudeFaction.ORCS)) {
            // Orcs only show up to siege, so they will find you wherever you're hiding
            this.npc.findTargetRange = Number.MAX_SAFE_INTEGER
            this.npc.enemyFilterFn = (enemies) => {
                // Only attack armed enemies if they are close enough to be dangerous, otherwise target the weak
                const nearbyArmedEnemies = enemies.filter(d => !!d.weapon && d.standingPosition.manhattanDistanceTo(this.dude.standingPosition) < 100)
                return nearbyArmedEnemies.length > 0 ? nearbyArmedEnemies : enemies
            }
        }

        // DEMON enemies will avoid light
        // TODO: make them burn in the light or something?
        // TODO: Consider splitting this class up 
        if (this.dude.factions.includes(DudeFaction.DEMONS)) {
            this.npc.isEnemyFn = d => {
                return !d.factions.includes(DudeFaction.DEMONS) && OutdoorDarknessMask.instance.isDark(d.standingPosition)
            }
            this.npc.pathFindingHeuristic = (pt: Point, goal: Point) => {
                return pt.distanceTo(goal) + (OutdoorDarknessMask.instance.isDark(pt.times(TILE_SIZE)) ? 0 : 100)
            }
            this.npc.findTargetRange *= 3
        } else {
            this.npc.isEnemyFn = d => d.isEnemy(this.dude)
        }
    }

    update() {
        if (this.dude.weapon) {
            this.dude.weapon.setDelayBetweenAttacks(500)
        }
    }
}