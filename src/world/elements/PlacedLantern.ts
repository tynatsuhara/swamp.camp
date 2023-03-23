import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point, pt } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { DialogueSource } from "../../characters/dialogue/Dialogue"
import { LANTERN_DIALOGUE } from "../../characters/dialogue/LanternDialogue"
import { player } from "../../characters/player/index"
import { Lantern } from "../../characters/weapons/Lantern"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { randomByteString } from "../../saves/uuid"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { LightManager } from "../LightManager"
import { Location } from "../locations/Location"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"

type SaveData = {
    id: string
    // on: boolean
    // fuel: number
}

export class PlacedLanternFactory extends ElementFactory<ElementType.PLACED_LANTERN, SaveData> {
    dimensions = pt(1)

    constructor() {
        super(ElementType.PLACED_LANTERN)
    }

    make(
        wl: Location,
        pos: Point,
        data: Partial<SaveData>
    ): ElementComponent<ElementType.PLACED_LANTERN, SaveData> {
        data.id ??= randomByteString()

        const e = new Entity()
        const position = pos.times(TILE_SIZE).plusY(-4)
        const depth = position.y + TILE_SIZE - 1
        const pixelCenterPos = position.plus(pt(TILE_SIZE / 2, 10))

        const sprite = Tilesets.instance.dungeonCharacters
            .getTileSource("tool_lantern")
            .toComponent(SpriteTransform.new({ position, depth }))

        e.addComponent(sprite)
        const lantern = e.addComponent(new PlacedLantern(wl, pixelCenterPos))

        e.addComponent(
            new Interactable(
                pixelCenterPos,
                () => {
                    DialogueDisplay.instance.startDialogue(lantern)
                },
                new Point(1, -TILE_SIZE),
                (interactor) => interactor === player()
            )
        )

        return e.addComponent(new ElementComponent(this.type, pos, () => ({ id: data.id })))
    }
}

export class PlacedLantern extends Component implements DialogueSource {
    dialogue = LANTERN_DIALOGUE

    constructor(private readonly location: Location, private readonly pixelCenterPos: Point) {
        super()
    }

    awake() {
        LightManager.instance.addLight(this.location, this, this.pixelCenterPos, Lantern.DIAMETER)
    }

    delete(): void {
        super.delete()
        LightManager.instance.removeLight(this)
    }
}
