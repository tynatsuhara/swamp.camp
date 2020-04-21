import { TileSet } from "./TileSet";
import { View } from "../View";

// TODO: Flesh out the tile editor

class TileEditor {
    readonly sets = new Map<string, TileSet>()

    register(id: string, tileSet: TileSet) {
        this.sets.set(id, tileSet)
    }

    getView(): View {
        return null
    }
}

export const tileEditor = new TileEditor()