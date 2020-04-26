import { TileComponent } from "./TileComponent"

export interface TileSource {
    toComponent(): TileComponent
}