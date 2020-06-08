import { DudeFactory, DudeType } from "../../characters/DudeFactory"
import { MapGenerator } from "../MapGenerator"
import { LocationManager } from "../LocationManager"

export enum QueuedEventType {
    TRADER_ARRIVAL
}

export type QueuedEventData = {
    type: QueuedEventType,
    time: number,
    [others: string]: any;
}

export const EVENT_QUEUE_HANDLERS: { [type: number]: (data: QueuedEventData) => void } = {
    [QueuedEventType.TRADER_ARRIVAL]: () => {
        DudeFactory.instance.new(DudeType.HERALD, MapGenerator.ENTER_LAND_POS, LocationManager.instance.exterior())
        console.log("the trader is here (ノ ″ロ″)ノ")
    }
}