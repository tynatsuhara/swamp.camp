import { Component } from "../../engine/Component"
import { Point } from "../../engine/Point"
import { Camera } from "./Camera"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { SpriteTransform } from "../../engine/sprites/SpriteTransform"
import { Lists } from "../../engine/util/Lists"
import { HUD } from "../ui/HUD"
import { TextOverlayManager } from "./TextOverlayManager"
import { WorldTime } from "../world/WorldTime"
import { TimeUnit } from "../world/TimeUnit"
import { DarknessMask } from "../world/DarknessMask"
import { Player } from "../characters/Player"
import { LocationManager } from "../world/LocationManager"
import { Enemy } from "../characters/Enemy"
import { TextAlign } from "../ui/Text"
import { CutsceneManager } from "./CutsceneManager"
import { saveManager } from "../SaveManager"
import { ShroomNPC } from "../characters/ShroomNPC"

// This is the cutscene that plays when the player dies
export class DeathCutscene extends Component {

    // durations in ms
    private readonly TRANSITION_PAUSE = 1000
    private readonly SHOW_TRANSITION = 3000

    start() {
        const centerPos = new Point(Camera.instance.dimensions.x/2, TextOverlayManager.TOP_BORDER)
                .plus(new Point(-TILE_SIZE/2, -TILE_SIZE))
        
        const deathIcon = Tilesets.instance.oneBit
                .getTileSource(Lists.oneOf(["tombstone1", "tombstone2", "skull-n-bones", "skull1", "skull2"]))
                .toComponent(SpriteTransform.new({ position: centerPos }))

        const text = Lists.oneOf([
            "You died. How unfortunate.",
        ])

        const button = Lists.oneOf([
            "WALK IT OFF",
            "GET UP",
            "OW!"
        ])

        setTimeout(() => {
            HUD.instance.locationTransition.transition(() => {
                // While the text overlay is active, the location transition will pause
                TextOverlayManager.instance.enable(
                    [text],
                    button,
                    () => this.respawn(),
                    [deathIcon],
                    TextAlign.CENTER,
                )
            }, this.TRANSITION_PAUSE)
        }, this.SHOW_TRANSITION)
    }

    respawn() {
        const respawnTime = DarknessMask.SUNRISE_START + TimeUnit.MINUTE * 10
        const timeUntilRespawn = WorldTime.instance.tomorrow(respawnTime) - WorldTime.instance.time
        WorldTime.instance.fastForward(timeUntilRespawn)

        Player.instance.dude.revive()

        // Clear out any enemies
        const dudes = LocationManager.instance.currentLocation.dudes
        dudes.forEach(d => {
            if (d.entity.getComponent(Enemy)) {
                dudes.delete(d)
            }
            d.entity.getComponent(ShroomNPC)?.delayTime(timeUntilRespawn)
        })

        // TODO take away resources, impact town stats, etc

        CutsceneManager.instance.finishCutscene()

        setTimeout(() => saveManager.save(), 1500);
    }
}