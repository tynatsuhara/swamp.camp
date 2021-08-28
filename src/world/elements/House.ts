import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { makeHouseInterior } from "../interior/House"
import { TeleporterPrefix } from "../Teleporter"
import { WorldLocation } from "../WorldLocation"
import { BuildingFactory } from "./Building"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { ElementUtils } from "./ElementUtils"
import { Interactable } from "./Interactable"

const RESIDENT_ATTRIBUTE = "rez"

export class HouseFactory extends BuildingFactory {

    readonly type = ElementType.HOUSE
    readonly dimensions = new Point(5, 4)

    make(wl: WorldLocation, pos: Point, data: any): ElementComponent {    
        const e = new Entity()

        // the interior location UUID
        const destinationUUID: string = data.destinationUUID ?? makeHouseInterior(wl).uuid

        const interactablePos = pos.plus(new Point(2.5, 3)).times(TILE_SIZE)
        const doorId = TeleporterPrefix.DOOR 
        wl.addTeleporter({ 
            to: destinationUUID, 
            pos: interactablePos.plusY(12), 
            id: doorId
        })
        
        // Set up tiles
        const depth = (pos.y + 3) * TILE_SIZE

        const addTile = (tileSheetPos: Point, pos: Point) => {
            const tile = Tilesets.instance.tilemap.getTileAt(tileSheetPos)
            const el = e.addComponent(new SpriteComponent(tile, new SpriteTransform(pos.times(TILE_SIZE))))
            el.transform.depth = depth
        }

        // flat roof
        const flatRoofTopLeft = new Point(6, 0)
        const basePos = pos.plusX(1)
        addTile(flatRoofTopLeft.plusX(1), basePos)
        addTile(flatRoofTopLeft.plusX(2), basePos.plusX(1))
        addTile(flatRoofTopLeft.plusX(3), basePos.plusX(2))
        addTile(flatRoofTopLeft.plusY(2).plusX(1), basePos.plusY(1))
        addTile(flatRoofTopLeft.plusY(2).plusX(2), basePos.plusY(1).plusX(1))
        addTile(flatRoofTopLeft.plusY(2).plusX(3), basePos.plusY(1).plusX(2))

        // door
        addTile(new Point(7, 6), basePos.plusY(2).plusX(1))

        // no windows
        addTile(new Point(7, 5), basePos.plusY(2))
        addTile(new Point(9, 5), basePos.plusY(2).plusX(2))

        // alternative with windows
        // addTile(new Point(5, 6), basePos.plusY(2))
        // addTile(new Point(6, 6), basePos.plusY(2).plusX(2))

        e.addComponent(new BoxCollider(basePos.plus(new Point(0, 1)).times(TILE_SIZE), new Point(TILE_SIZE*3, TILE_SIZE*2)))

        // Set up teleporter
        e.addComponent(new Interactable(
            interactablePos, 
            () => wl.useTeleporter(destinationUUID, doorId), 
            new Point(0, -TILE_SIZE*1.4)
        ))

        // parse residents as string or array for backwards compatibility
        let residents: string[]
        if (!data[RESIDENT_ATTRIBUTE]) {
            residents = []
        } else if (typeof data[RESIDENT_ATTRIBUTE] === "string") {
            residents = [data[RESIDENT_ATTRIBUTE]]
        } else {
            residents = data[RESIDENT_ATTRIBUTE]
        }

        const house = e.addComponent(new House(1, destinationUUID, residents))

        return e.addComponent(new ElementComponent(
            ElementType.HOUSE, 
            pos,
            this.getOccupiedPoints(pos),
            () => ({
                destinationUUID,
                // store rez as string for backwards compatibility
                [RESIDENT_ATTRIBUTE]: house.getResidents()
            })
        ))
    }
    
    getOccupiedPoints(pos: Point) {
        return ElementUtils.rectPoints(pos.plus(new Point(1, 1)), new Point(3, 2))
    }
}

export class House extends Component {
    private static readonly PENDING_RESIDENT = "pending"

    readonly capacity: number
    readonly locationUUID: string

    private residents: string[]

    constructor(capacity: number, locationUUID: string, residents: string[]) {
        super()
        this.capacity = capacity
        this.locationUUID = locationUUID
        this.residents = residents
    }

    getResidents = () => this.residents

    hasCapacity = () => this.residents.length < this.capacity

    isResidentPending = () => this.residents.includes(House.PENDING_RESIDENT)

    isHomeOf = (uuid: string) => this.residents.includes(uuid)

    setResidentPending() {
        if (!this.hasCapacity) {
            throw new Error("can't set a pending resident if capacity is met")
        }
        this.residents.push(House.PENDING_RESIDENT)
    }

    claimPendingSlot(uuid: string) {
        const i = this.residents.indexOf(House.PENDING_RESIDENT)
        if (i < 0 && this.residents.length === this.capacity) {
            throw new Error("no room! no room!")
        }
        this.residents[i] = uuid
    }

    evictResident(uuid: string) {
        this.residents = this.residents.filter(r => r !== uuid)
    }
}