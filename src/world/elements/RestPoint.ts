import { Component } from "brigsby/dist"
import { DudeType } from "../../characters/DudeType"
import { NPC } from "../../characters/NPC"
import { player } from "../../characters/player"
import { session } from "../../online/session"
import { syncFn } from "../../online/syncUtils"
import { saveManager } from "../../SaveManager"
import { HUD } from "../../ui/HUD"
import { DarknessMask } from "../DarknessMask"
import { camp, here } from "../locations/LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { Campfire } from "./Campfire"
import { ElementType } from "./Elements"

const restTransition = syncFn("rest", (hours: number) => {
    const pause = 1200

    HUD.instance.locationTransition.transition(() => {
        if (session.isHost()) {
            WorldTime.instance.fastForward(hours * TimeUnit.HOUR)
            setTimeout(() => saveManager.autosave(), pause + 500)
            here()
                .getDudes()
                .filter((d) => d.type === DudeType.PLAYER)
                .forEach((d) => d.setWeaponAndShieldDrawn(false))
        }
    }, pause)
})

export class RestPoint extends Component {
    rest(hours: number) {
        restTransition(hours)
    }

    canRestFor(hours: number, atCampfire?: Campfire) {
        const isTargeted = here()
            .getDudes()
            .some((d) => d.entity.getComponent(NPC)?.targetedEnemy === player())

        if (isTargeted) {
            return false
        }

        const timeOfDay = WorldTime.instance.time % TimeUnit.DAY

        let hoursNeeded = 0
        for (let i = 1; i <= hours; i++) {
            const time = (timeOfDay + i * TimeUnit.HOUR) % TimeUnit.DAY
            // if it'll be dark in that hour, we need the campfire to burn until then
            if (time < DarknessMask.SUNRISE_START || time >= DarknessMask.SUNSET_END) {
                hoursNeeded = i
            }
        }

        if (atCampfire) {
            return atCampfire.willBurnFor(hoursNeeded * TimeUnit.HOUR)
        }

        return camp()
            .getElementsOfType(ElementType.CAMPFIRE)
            .map((el) => el.entity.getComponent(Campfire))
            .some((campfire) => campfire.willBurnFor(hoursNeeded * TimeUnit.HOUR))
    }
}
