import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point, pt } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { DialogueSource } from "../../characters/dialogue/Dialogue"
import { LANTERN_DIALOGUE } from "../../characters/dialogue/LanternDialogue"
import { player } from "../../characters/player/index"
import { Lantern } from "../../characters/weapons/Lantern"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ItemMetadata } from "../../items/Items"
import { randomByteString } from "../../saves/uuid"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { LightManager } from "../LightManager"
import { Location } from "../locations/Location"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"

type SaveData = {
    id: string // TODO
    on: boolean
    fuel: number
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
        data.on ??= true
        data.fuel ??= 0

        const e = new Entity()

        const lantern = e.addComponent(new PlacedLantern(wl, pos, data as SaveData))

        e.addComponent(
            new Interactable(
                lantern.pixelCenterPos,
                () => {
                    DialogueDisplay.instance.startDialogue(lantern)
                },
                new Point(1, -TILE_SIZE),
                (interactor) => interactor === player()
            )
        )

        return e.addComponent(new ElementComponent(this.type, pos, () => lantern.save()))
    }

    itemMetadataToSaveFormat(metadata: ItemMetadata): Partial<SaveData> {
        return {
            on: true,
            fuel: metadata.fuel ?? 0,
        }
    }
}

export class PlacedLantern extends Component implements DialogueSource {
    dialogue = LANTERN_DIALOGUE
    private onSprite: SpriteComponent
    private offSprite: SpriteComponent

    private get position() {
        return this.pos.times(TILE_SIZE).plusY(-4)
    }
    get pixelCenterPos() {
        return this.position.plus(pt(TILE_SIZE / 2, 10))
    }

    constructor(
        private readonly location: Location,
        private readonly pos: Point,
        private readonly data: SaveData
    ) {
        super()
    }

    awake() {
        const position = this.position
        const depth = position.y + TILE_SIZE - 1

        const sprite = (name: string) =>
            this.entity.addComponent(
                Tilesets.instance.dungeonCharacters
                    .getTileSource(name)
                    .toComponent(SpriteTransform.new({ position, depth }))
            )

        this.onSprite = sprite("tool_lantern")
        this.offSprite = sprite("tool_lantern_off")

        // let this handle setting up lights, sprite config, etc
        this.toggleOnOff()
        this.toggleOnOff()
    }

    save() {
        return this.data
    }

    delete(): void {
        super.delete()
        this.removeLight()
    }

    isOn() {
        return this.data.on
    }

    toggleOnOff() {
        this.data.on = !this.data.on
        if (this.data.on) {
            this.addLight()
        } else {
            this.removeLight()
        }
        this.onSprite.enabled = this.data.on
        this.offSprite.enabled = !this.data.on
    }

    getInvItemMetadata() {
        return { fuel: 0 } // TODO
    }

    private addLight() {
        LightManager.instance.addLight(this.location, this, this.pixelCenterPos, Lantern.DIAMETER)
    }

    private removeLight() {
        LightManager.instance.removeLight(this)
    }
}
