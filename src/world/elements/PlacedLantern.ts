import { UpdateData } from "brigsby/dist/Engine"
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
import { clientSyncFn } from "../../online/syncUtils"
import { randomByteString } from "../../saves/uuid"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { LightManager } from "../LightManager"
import { Location } from "../locations/Location"
import { Simulatable } from "../Simulatable"
import { TimeUnit } from "../TimeUnit"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"

const FUEL_MAX_HOURS = 24
const FUEL_MAX = TimeUnit.HOUR * FUEL_MAX_HOURS
const FUEL_PER_OIL_ITEM = TimeUnit.HOUR * 4

type SaveData = {
    id: string
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
        data.on ??= false
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
            fuel: metadata.fuel ?? 0,
            on: metadata.fuel > 0,
        }
    }
}

export class PlacedLantern extends Simulatable implements DialogueSource {
    static readonly FUEL_MAX_HOURS = FUEL_MAX_HOURS

    dialogue = LANTERN_DIALOGUE
    private onSprite: SpriteComponent
    private offSprite: SpriteComponent

    private get position() {
        return this.pos.times(TILE_SIZE).plusY(-4)
    }
    get pixelCenterPos() {
        return this.position.plus(pt(TILE_SIZE / 2, 10))
    }

    get on() {
        return this.data.on
    }

    constructor(
        private readonly location: Location,
        private readonly pos: Point,
        private readonly data: SaveData
    ) {
        super()

        this.addFuel = clientSyncFn(data.id, "all", () => {
            this.data.fuel = Math.min(this.data.fuel + FUEL_PER_OIL_ITEM, FUEL_MAX)
            if (!this.on) {
                this.toggleOnOff()
            }
        })

        this.simulate = location.elementSyncFn("sim", pos, (duration) => {
            this.burn(duration)
        })
    }

    // sync fns
    addFuel: () => void
    simulate: (duration: number) => void

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

        this.updateOnOffState()
    }

    update({ elapsedTimeMillis }: UpdateData): void {
        this.burn(elapsedTimeMillis)
    }

    getFuelAmount() {
        return this.data.fuel
    }

    getInvItemMetadata() {
        return { fuel: this.data.fuel }
    }

    canAddFuel() {
        return Math.ceil(this.data.fuel / TimeUnit.HOUR) < FUEL_MAX_HOURS
    }

    save() {
        return this.data
    }

    delete(): void {
        super.delete()
        this.removeLight()
    }

    toggleOnOff() {
        this.data.on = !this.data.on
        this.updateOnOffState()
    }

    private burn(millis: number) {
        if (this.on) {
            this.data.fuel -= millis
            if (this.data.fuel < 0) {
                this.data.fuel = 0
                this.toggleOnOff()
            }
        }
    }

    private updateOnOffState() {
        if (this.on) {
            this.addLight()
        } else {
            this.removeLight()
        }
        this.onSprite.enabled = this.on
        this.offSprite.enabled = !this.on
    }

    private addLight() {
        LightManager.instance.addLight(this.location, this, this.pixelCenterPos, Lantern.DIAMETER)
    }

    private removeLight() {
        LightManager.instance.removeLight(this)
    }
}
