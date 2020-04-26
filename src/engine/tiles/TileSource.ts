import { TileComponent } from "./TileComponent"
import { Point } from "../point"
import { TileTransform } from "./TileTransform"

export interface TileSource {
    toComponent(): TileComponent
}