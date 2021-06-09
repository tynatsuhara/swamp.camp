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
import { LocationTransition } from "../../ui/LocationTransition"

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
        
        const transition = e.addComponent(new LocationTransition())

        e.addComponent(new Interactable(
            scaledPos.plus(new Point(TILE_SIZE/2, TILE_SIZE/2)), 
            () => {
                DialogueDisplay.instance.startDialogue(bed)
            }, 
            new Point(1, -TILE_SIZE),
        ))

        return e.addComponent(new ElementComponent(
            ElementType.BED, 
            pos,
            [pos], 
            () => { return {} }
        ))
    }

    canPlace(pos: Point) {
        return LocationManager.instance.currentLocation !== LocationManager.instance.exterior()
    }
}

export class Bed extends Component implements DialogueSource {

    dialogue: string = BED_DIALOGUE

    constructor() {
        super()
    }
}