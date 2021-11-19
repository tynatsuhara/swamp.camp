import { measure } from "brigsby/dist/Profiler"
import { newUUID } from "./uuid"

/**
 * Serializes an object and removes all circular references
 */
export const serialize = (object) => {
    const resultObject = {} // maps string->object with subobjects as uuids
    const topLevelUuidMap = {} // maps string->object with subobjects as uuids
    const objectUuidMap = new Map<Object, string>() // maps unique object ref to uuid
    const [buildDuration] = measure(() =>
        buildObject(object, resultObject, topLevelUuidMap, objectUuidMap)
    )
    console.log(`obj built in ${buildDuration}`)
    return JSON.stringify(
        {
            uuids: topLevelUuidMap,
            obj: resultObject,
        },
        undefined,
        4
    )
}

const buildObject = (object, resultObject, topLevelUuidMap, objectUuidMap: Map<Object, string>) => {
    const stack = []
    stack.push({ object, resultObject })

    while (stack.length > 0) {
        const { object, resultObject } = stack.pop()
        Object.keys(object).forEach((k) => {
            if (object instanceof Object) {
                let uuid = objectUuidMap.get(object)
                if (!!uuid) {
                    // we have already traversed this object
                    console.log(`seen ${uuid}`)
                    resultObject[k] = uuid
                } else {
                    uuid = newUUID()
                    resultObject[k] = uuid
                    objectUuidMap.set(object, uuid)
                    topLevelUuidMap[uuid] = {}
                    stack.push({
                        object: object[k],
                        resultObject: topLevelUuidMap[uuid],
                    })
                }
            } else {
                resultObject[k] = object
            }
        })
    }
}
