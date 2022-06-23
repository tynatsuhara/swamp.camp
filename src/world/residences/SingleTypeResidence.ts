import { DudeType } from "../../characters/DudeFactory"
import { Residence } from "./Residence"

export class SingleTypeResidence extends Residence {
    private static readonly PENDING_RESIDENT = "pending"

    readonly type: DudeType
    readonly capacity: number
    readonly locationUUID: string

    private residents: string[]

    constructor(type: DudeType, capacity: number, locationUUID: string, residents: string[]) {
        super()
        this.type = type
        this.capacity = capacity
        this.locationUUID = locationUUID
        this.residents = residents
    }

    getResidents = () => this.residents

    hasCapacity = (type: DudeType) => type === this.type && this.residents.length < this.capacity

    canClaimPendingSlot = (type: DudeType) =>
        type === this.type && this.residents.includes(SingleTypeResidence.PENDING_RESIDENT)

    isHomeOf = (uuid: string) => this.residents.includes(uuid)

    setResidentPending = () => {
        this.residents.push(SingleTypeResidence.PENDING_RESIDENT)
    }

    claimPendingSlot = (type: DudeType, uuid: string) => {
        const i = this.residents.indexOf(SingleTypeResidence.PENDING_RESIDENT)
        if (i < 0 && this.residents.length === this.capacity) {
            throw new Error("no room! no room!")
        }
        this.residents[i] = uuid
    }

    evictResident = (uuid: string) => {
        this.residents = this.residents.filter((r) => r !== uuid)
    }
}
