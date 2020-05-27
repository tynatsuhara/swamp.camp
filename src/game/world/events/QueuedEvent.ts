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
        console.log("the trader is here (ノ ″ロ″)ノ")
    }
}