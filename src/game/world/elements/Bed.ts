import { Component } from "../../../engine/Component"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Point } from "../../../engine/Point"
import { Interactable } from "./Interactable"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { ElementComponent } from "./ElementComponent"
import { WorldLocation } from "../WorldLocation"
import { Entity } from "../../../engine/Entity"
import { ElementType } from "./Elements"
import { DialogueSource } from "../../characters/Dialogue"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { BED_DIALOGUE } from "../../characters/dialogues/ItemDialogues"
import { ElementFactory } from "./ElementFactory"
import { LocationManager } from "../LocationManager"
import { WorldTime } from "../WorldTime"
import { HUD } from "../../ui/HUD"
import { saveManager } from "../../SaveManager"
import { Campfire } from "./Campfire"
import { UIStateManager } from "../../ui/UIStateManager"
import { TimeUnit } from "../TimeUnit"
import { DarknessMask } from "../DarknessMask"

export class BedFactory extends ElementFactory {

    readonly type = ElementType.BED
    readonly dimensions = new Point(1, 1)

    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {
        const e = new Entity()
        const scaledPos = pos.times(TILE_SIZE)
        const depth = scaledPos.y + TILE_SIZE - 10
        
        e.addComponent(new TileComponent(
            Tilesets.instance.outdoorTiles.getTileSource("bed"), 
            TileTransform.new({ position: scaledPos, depth })
        ))

        e.addComponent(new BoxCollider(scaledPos, new Point(TILE_SIZE, TILE_SIZE)))

        const bed = e.addComponent(new Bed())        

        e.addComponent(new Interactable(
            scaledPos.plus(new Point(TILE_SIZE/2-1, TILE_SIZE/2-1)), 
            () => {
                DialogueDisplay.instance.startDialogue(bed)
            }, 
            new Point(1, -TILE_SIZE),
            () => {
                // Proxy for determining that this bed belongs to the player
                return LocationManager.instance.currentLocation.allowPlacing 
                        && !UIStateManager.instance.isMenuOpen
                    
            }
        ))

        return e.addComponent(new ElementComponent(
            ElementType.BED, 
            pos,
            [pos], 
            () => { return {} }
        ))
    }

    canPlaceInLocation(wl: WorldLocation) {
        return wl !== LocationManager.instance.exterior()
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
        const hourOfDay = (WorldTime.instance.time % TimeUnit.DAY) / TimeUnit.HOUR

        let hoursNeeded = 0
        for (let i = 0; i < hours; i++) {
            const hour = (hourOfDay + i) % TimeUnit.DAY
            if (hour < DarknessMask.DAYBREAK_HOUR || hour >= DarknessMask.DUSK_HOUR) {
                hoursNeeded = i
            }
        }

        return LocationManager.instance.exterior()
                .getElementsOfType(ElementType.CAMPFIRE)
                .map(el => el.entity.getComponent(Campfire))
                .some(campfire => campfire.willBurnFor(hoursNeeded * TimeUnit.HOUR))
    }
}