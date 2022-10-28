import { joinRoom } from "trystero"

export const room = joinRoom(
    { appId: "92fe373a-2446-426a-8b8d-28b51bb30b01" },
    "30908535-9bba-4e21-8a68-3384b7cd604f"
)

export const isHost = !!localStorage.getItem("host")

export const syncData = <T extends object>(id: string, data: T, onChange = () => {}) => {
    const [sender, receiver] = room.makeAction<Partial<T>>(id)

    const proxy = new Proxy(data, {
        set(target, property, value, receiver) {
            if (!isHost) {
                console.warn("client cannot update data")
                return
            }
            let success = Reflect.set(target, property, value, receiver)
            if (success) {
                // @ts-ignore
                sender({ [property]: value })
            }
            return success
        },
    })

    receiver((newData) => {
        Object.keys(newData).forEach((key) => {
            data[key] = newData[key]
        })
        onChange()
    })

    return proxy
}
