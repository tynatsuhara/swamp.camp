import { Component, Point } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { DudeType } from "../characters/DudeType"
import { Enemy } from "../characters/types/Enemy"
import { ShroomNPC } from "../characters/types/ShroomNPC"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { saveManager } from "../SaveManager"
import { HUD } from "../ui/HUD"
import { TextAlign } from "../ui/Text"
import { DarknessMask } from "../world/DarknessMask"
import { Ground } from "../world/ground/Ground"
import { camp, here } from "../world/locations/LocationManager"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"
import { Camera } from "./Camera"
import { CutsceneManager } from "./CutsceneManager"
import { TextOverlayManager } from "./TextOverlayManager"

// This is the cutscene that plays when the player dies
// MPTODO: Only trigger this is all players are dead. Allow others to revive!
export class DeathCutscene extends Component {
    // durations in ms
    private readonly TRANSITION_PAUSE = 1000
    private readonly SHOW_TRANSITION = 3000

    start() {
        const centerPos = new Point(
            Camera.instance.dimensions.x / 2,
            TextOverlayManager.TOP_BORDER
        ).plus(new Point(-TILE_SIZE / 2, -TILE_SIZE))

        const deathIcon = Tilesets.instance.oneBit
            .getTileSource(
                Lists.oneOf(["tombstone1", "tombstone2", "skull-n-bones", "skull1", "skull2"])
            )
            .toComponent(
                SpriteTransform.new({ position: centerPos, depth: TextOverlayManager.DEPTH })
            )

        const button = Lists.oneOf(["WALK IT OFF", "GET UP", "OW!"])

        setTimeout(() => {
            HUD.instance.locationTransition.transition(() => {
                // While the text overlay is active, the location transition will pause
                TextOverlayManager.instance.open({
                    text: this.getText(),
                    finishAction: button,
                    onFinish: () => this.respawn(),
                    additionalComponents: () => [deathIcon],
                    textAlign: TextAlign.CENTER,
                })
            }, this.TRANSITION_PAUSE)
        }, this.SHOW_TRANSITION)
    }

    private getText(): string[] {
        if (!saveManager.getState().hasDied) {
            saveManager.setState({ hasDied: true })
            return [
                `As your soul begins to leave your body, you feel the ancient magic of the swamp resist.
                
Your work here is not yet done.`,
            ]
        }

        const suffix = Lists.oneOf([
            "How unfortunate.",
            "Again, really?",
            "Oof.",
            "Better luck next time.",
            "Great job!",
        ])

        return [`You died. ${suffix}`]
    }

    respawn() {
        const respawnTime = DarknessMask.SUNRISE_START + TimeUnit.MINUTE * 10
        const timeUntilRespawn = WorldTime.instance.tomorrow(respawnTime) - WorldTime.instance.time
        WorldTime.instance.fastForward(timeUntilRespawn)

        // If the player dies off map, just put them at a random on-map location.
        // TODO: Respawn them at the doctor, their bed, or somewhere else that makes sense.
        here()
            .getDudes()
            .filter((d) => d.type === DudeType.PLAYER && !d.isAlive)
            .forEach((p) => {
                if (p.getCurrentOffMapArea()) {
                    const newSpot = Lists.findRandom(
                        camp().getGroundSpots(),
                        (pos) =>
                            !Ground.isWater(camp().getGround(pos)?.type) && !camp().isOccupied(pos)
                    )
                    p.moveTo(newSpot.times(TILE_SIZE), true)
                }

                setTimeout(() => p.revive(), 850)
            })

        Camera.instance.jumpCutToFocalPoint()

        // Clear out any enemies
        here()
            .getDudes()
            .forEach((d) => {
                if (d.entity.getComponent(Enemy)) {
                    d.entity.selfDestruct()
                } else {
                    d.entity.getComponent(ShroomNPC)?.delayTime(timeUntilRespawn)
                }
            })

        here().removeAllDroppedItems()

        // TODO take away resources, impact town stats, etc

        CutsceneManager.instance.finishCutscene()

        setTimeout(() => saveManager.autosave(), 1500)
    }
}
