import { Component } from "brigsby/dist/Component"
import { DudeType } from "../../characters/DudeFactory"

export abstract class Residence extends Component {
    abstract readonly locationUUID: string

    abstract getResidents: () => string[]

    abstract hasCapacity: (type: DudeType) => boolean

    abstract isHomeOf: (uuid: string) => boolean

    abstract setResidentPending: (type: DudeType) => void

    abstract canClaimPendingSlot: (type: DudeType) => boolean

    abstract claimPendingSlot: (uuid: string) => void

    abstract evictResident: (uuid: string) => void
}
