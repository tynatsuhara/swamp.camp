import { Entity } from "../engine/Entity"
import { Grid } from "../engine/util/Grid"
import { Point } from "../engine/point"

/**
 * Used for tracking things that align to the x/y grid
 * Uses non-pixel coordinates (everything will be multipled by TILE_SIZE)
 */
export class TileEntityManager extends Grid<Entity> {

    static instance: TileEntityManager

    constructor() {
        super()
        TileEntityManager.instance = this
    }
}