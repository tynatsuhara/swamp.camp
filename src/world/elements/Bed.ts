import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Lists } from "brigsby/dist/util/Lists"
import { DialogueSource } from "../../characters/dialogue/Dialogue"
import { BED_DIALOGUE } from "../../characters/dialogue/ItemDialogues"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { saveManager } from "../../SaveManager"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { HUD } from "../../ui/HUD"
import { DarknessMask } from "../DarknessMask"
import { Location } from "../Location"
import { camp } from "../LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { Breakable } from "./Breakable"
import { Campfire } from "./Campfire"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"
import { NavMeshCollider } from "./NavMeshCollider"

export class BedFactory extends ElementFactory {
    readonly type = ElementType.BED
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: object): ElementComponent {
        const e = new Entity()
        const scaledPos = pos.times(TILE_SIZE)
        const depth = scaledPos.y + TILE_SIZE - 10
        const pixelCenterPos = scaledPos.plus(new Point(TILE_SIZE / 2 - 1, TILE_SIZE / 2 - 1))

        const tile = e.addComponent(
            new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource("bed"),
                SpriteTransform.new({ position: scaledPos, depth })
            )
        )

        e.addComponent(new NavMeshCollider(wl, scaledPos, new Point(TILE_SIZE, TILE_SIZE)))

        const bed = e.addComponent(new Bed())

        e.addComponent(
            new Breakable(pixelCenterPos, [tile.transform], () =>
                Lists.repeat(Math.random() * 4 + 4, [Item.WOOD])
            )
        )

        e.addComponent(
            new Interactable(
                pixelCenterPos,
                () => {
                    DialogueDisplay.instance.startDialogue(bed)
                },
                new Point(1, -TILE_SIZE)
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.BED, pos, () => {
                return {}
            })
        )
    }

    canPlaceInLocation(wl: Location) {
        return wl !== camp()
    }
}

export class Bed extends Component implements DialogueSource {
    dialogue: string = BED_DIALOGUE

    sleep(duration: number) {
        const pause = 1200
        HUD.instance.locationTransition.transition(() => {
            WorldTime.instance.fastForward(duration)
            setTimeout(() => saveManager.save(), pause + 500)
        }, pause)
    }

    canSleepFor(hours: number) {
        const timeOfDay = WorldTime.instance.time % TimeUnit.DAY

        let hoursNeeded = 0
        for (let i = 1; i <= hours; i++) {
            const time = (timeOfDay + i * TimeUnit.HOUR) % TimeUnit.DAY
            // if it'll be dark in that hour, we need the campfire to burn until then
            if (time < DarknessMask.SUNRISE_START || time >= DarknessMask.SUNSET_END) {
                hoursNeeded = i
            }
        }

        return camp()
            .getElementsOfType(ElementType.CAMPFIRE)
            .map((el) => el.entity.getComponent(Campfire))
            .some((campfire) => campfire.willBurnFor(hoursNeeded * TimeUnit.HOUR))
    }
}
