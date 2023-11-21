import { AwakeData, Component, Point } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { CommonWorldSounds } from "../../audio/CommonWorldSounds"
import { Particles } from "../../graphics/particles/Particles"
import { Item } from "../../items/Item"
import { session } from "../../online/session"
import { syncFn } from "../../online/syncUtils"
import { Color } from "../../ui/Color"
import { Dude } from "../Dude"
import { ONION_DIALOGUE_ENTRYPOINT } from "../dialogue/OnionDialogue"
import { player } from "../player"

export class Onion extends Component {
    private dude: Dude

    awake(awakeData: AwakeData): void {
        this.entity.getComponent(Dude).dialogue = ONION_DIALOGUE_ENTRYPOINT
        this.dude = this.entity.getComponent(Dude)
        this.eat = syncFn(this.dude.syncId("onyo"), this.eat.bind(this))
    }

    eat() {
        CommonWorldSounds.playEatSound()

        this.emitParticles()

        if (session.isHost()) {
            player().inventory.addItem(Item.ONION)
            this.entity.selfDestruct()
        }
    }

    private emitParticles() {
        const position = this.dude.standingPosition.plusY(-10)
        for (let i = 0; i < 10; i++) {
            const speed = Math.random() > 0.5 ? 0.01 : 0.03
            const pos = position.randomCircularShift(5)
            Particles.instance.emitParticle(
                Lists.oneOf([Color.WHITE, Color.BROWN_6]),
                pos,
                pos.y,
                250 + Math.random() * 250,
                (t) => new Point(0, t * speed),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }
    }
}
