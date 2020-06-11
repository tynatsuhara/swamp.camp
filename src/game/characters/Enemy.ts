import { Component } from "../../engine/component"
import { UpdateData, StartData } from "../../engine/engine"
import { Dude } from "./Dude"
import { Point } from "../../engine/point"
import { LocationManager } from "../world/LocationManager"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Lists } from "../../engine/util/Lists"
import { NPC } from "./NPC"

export class Enemy extends Component {

    private dude: Dude
    private npc: NPC

    awake() {
        this.dude = this.entity.getComponent(Dude)
        this.dude.weapon.setDelayBetweenAttacks(500)
        this.npc = this.entity.getComponent(NPC)
        this.npc.isEnemyFn = d => d.faction != this.dude.faction
    }
}