import { Component } from "brigsby/dist/Component"
import { DudeType } from "../../characters/DudeFactory"

export abstract class Residence extends Component {

    readonly abstract locationUUID: string

    abstract hasCapacity: (type: DudeType) => boolean

    abstract isHomeOf: (uuid: string) => boolean

    abstract setResidentPending: () => void
    
    abstract isResidentPending: () => boolean

    abstract claimPendingSlot: (uuid: string) => void

    abstract evictResident: (uuid: string) => void
}