import { Player } from "../characters/Player"
import { Ambiance } from "./Ambiance"
import { Music } from "./Music"

export class WorldAudioContext {
    static readonly instance = new WorldAudioContext()
    private readonly listeners: ((ctx: WorldAudioContext) => void)[] = [
        Ambiance.determineAmbiance,
        Music.determineMusic,
    ]

    private _time: number
    get time() {
        return this._time
    }
    set time(value: number) {
        if (this._time != value) {
            this._time = value
            this.notifyListeners()
        }
    }

    private _isInterior: boolean
    get isInterior() {
        return this._isInterior
    }
    set isInterior(value: boolean) {
        if (this._isInterior != value) {
            this._isInterior = value
            this.notifyListeners()
        }
    }

    private _isInBattle: boolean
    get isInBattle() {
        return this._isInBattle
    }
    set isInBattle(value: boolean) {
        if (this._isInBattle != value) {
            this._isInBattle = value
            this.notifyListeners()
        }
    }

    private notifyListeners() {
        if (!Player.instance?.dude) {
            return
        }
        this.listeners.forEach((l) => l(this))
    }
}
