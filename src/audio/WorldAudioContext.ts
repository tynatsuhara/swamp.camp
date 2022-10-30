import { player } from "../characters/player"
import { Singletons } from "../Singletons"
import { Ambiance } from "./Ambiance"
import { Music } from "./Music"

export class WorldAudioContext {
    static get instance() {
        return Singletons.getOrCreate(WorldAudioContext)
    }

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
            // this.notifyListeners()
        }
    }

    private _isInBattle: boolean
    get isInBattle() {
        return this._isInBattle
    }
    set isInBattle(value: boolean) {
        if (this._isInBattle != value) {
            this._isInBattle = value
            // this.notifyListeners()
        }
    }

    private notifyListeners() {
        // This is a proxy that prevents music from starting until
        // the game has really started (after the first cutscene)
        // TODO: How to do this better?
        if (!player()?.dude) {
            return
        }
        this.listeners.forEach((l) => l(this))
    }
}
