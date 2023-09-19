import { session } from "../online/session"
import { syncData } from "../online/syncUtils"
import { NotificationDisplay } from "../ui/NotificationDisplay"

const pauseSynced = syncData("paused", { current: false }, ({ current: nowPaused }) => {
    if (nowPaused) {
        NotificationDisplay.instance.push({
            text: "Host paused",
            icon: "pause",
            isExpired: () => !pauseSynced.current,
        })
    }
})

export const isGamePaused = () => pauseSynced.current

export const setGamePaused = (value: boolean) => {
    if (session.isHost()) {
        pauseSynced.current = value
    }
}
