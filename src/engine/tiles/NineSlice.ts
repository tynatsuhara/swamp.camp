import { Component } from "../component"
import { TileSource } from "./TileSource"
import { Point } from "../point"
import { TileTransform } from "./TileTransform"
import { TileComponent } from "./TileComponent"

/**
 * @param slice the 9 parts to use to make a rectangle
 * @param pos top-left top-left position
 * @param dimensions dimensions of the desired rectangle in tile units
 */
export const makeNineSliceTileComponents = (slice: TileSource[], pos: Point, dimensions: Point): TileComponent[] => {
    if (slice.length !== 9) {
        throw new Error("nine slice gotta have nine slices ya dip")
    }
    const tiles: TileComponent[] = []
    tiles.push(slice[0].toComponent(new TileTransform(new Point(0, 0))))
    tiles.push(slice[2].toComponent(new TileTransform(new Point(dimensions.x - 1, 0))))
    tiles.push(slice[8].toComponent(new TileTransform(new Point(dimensions.x - 1, dimensions.y - 1))))
    tiles.push(slice[6].toComponent(new TileTransform(new Point(0, dimensions.y - 1))))
    // horizontal lines
    for (let i = 1; i < dimensions.x - 1; i++) {
        tiles.push(slice[1].toComponent(new TileTransform(new Point(i, 0))))
        tiles.push(slice[7].toComponent(new TileTransform(new Point(i, dimensions.y - 1))))
    }
    // vertical lines
    for (let j = 1; j < dimensions.y - 1; j++) {
        tiles.push(slice[5].toComponent(new TileTransform(new Point(dimensions.x - 1, j))))
        tiles.push(slice[3].toComponent(new TileTransform(new Point(0, j))))
    }
    // middle
    for (let x = 1; x < dimensions.x - 1; x++) {
        for (let y = 1; y < dimensions.y - 1; y++) {
            tiles.push(slice[4].toComponent(new TileTransform(new Point(x, y))))
        }
    }
    
    tiles.forEach(c => {
        c.transform.position = c.transform.position.times(tiles[0].transform.dimensions.x).plus(pos)
    })

    return tiles
}