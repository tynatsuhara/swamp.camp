import { TileComponent } from "./TileComponent"
import { TileTransform } from "./TileTransform"

export interface TileSource {
    toComponent(): TileComponent
    toComponent(transform: TileTransform): TileComponent
}