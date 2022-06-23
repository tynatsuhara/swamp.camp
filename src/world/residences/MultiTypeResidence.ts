import { DudeType } from "../../characters/DudeFactory"
import { Residence } from "./Residence"

export class MultiTypeResidence extends Residence {
    private static readonly PENDING_RESIDENT = "pending"

    readonly capacity: { [type: number]: number }
    readonly locationUUID: string

    private residents: { [type: number]: string[] } = {}

    constructor(
        capacity: { [type: number]: number },
        locationUUID: string,
        residents: { [type: number]: string[] } = {}
    ) {
        super()
        this.capacity = capacity
        this.locationUUID = locationUUID
        this.residents = residents
    }

    getResidents = () => {
        return this.residents
    }

    hasCapacity = (type: DudeType) => {
        const capacityForType = this.capacity[type] ?? 0
        const currentlyFilled = this.residents[type] ?? []
        return currentlyFilled.length < capacityForType
    }

    canClaimPendingSlot = (type: DudeType) => {
        const residentsOfType = this.residents[type] ?? []
        return residentsOfType.includes(MultiTypeResidence.PENDING_RESIDENT)
    }

    isHomeOf = (uuid: string) => {
        return Object.values(this.residents).some((list) => list.includes(uuid))
    }

    setResidentPending = (type: DudeType) => {
        this.residents[type] = this.residents[type] ?? []
        this.residents[type].push(MultiTypeResidence.PENDING_RESIDENT)
    }

    /**
     * Should call @see canClaimPendingSlot first
     */
    claimPendingSlot = (type: DudeType, uuid: string) => {
        const list = this.residents[type]
        const i = list.indexOf(MultiTypeResidence.PENDING_RESIDENT)
        if (i < 0) {
            throw new Error("no room! no room!")
        }
        list[i] = uuid
    }

    evictResident = (uuid: string) => {
        Object.keys(this.residents).forEach((type) => {
            this.residents[type] = this.residents[type].filter((r: string) => r !== uuid)
        })
    }
}
