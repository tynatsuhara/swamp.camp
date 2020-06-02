import { Component } from "../component"
import { TileSource } from "./TileSource"
import { Point } from "../point"
import { TileTransform } from "./TileTransform"
import { TileComponent } from "./TileComponent"

export const NineSlice = {
    nineSlice: (
        dimensions: Point, 
        fn: (pt: Point, nineSliceIndex: number) => void
    ) => {
        if (dimensions.x < 2 || dimensions.y < 2) {
            throw new Error("9 slice should be at least 2x2")
        }

        for (let x = 0; x < dimensions.x; x++) {
            for (let y = 0; y < dimensions.y; y++) {
                const pt = new Point(x, y)
                const edgeTop = y === 0
                const edgeBottom = y === dimensions.y-1
                const edgeLeft = x === 0
                const edgeRight = x === dimensions.x-1

                if (edgeLeft && edgeTop) {
                    fn(pt, 0)
                } else if (edgeTop && !edgeRight) {
                    fn(pt, 1)
                } else if (edgeTop) {
                    fn(pt, 2)
                } else if (edgeLeft && !edgeBottom) {
                    fn(pt, 3)
                } else if (!edgeTop && !edgeBottom && !edgeLeft && !edgeRight) {
                    fn(pt, 4)
                } else if (edgeRight && !edgeBottom) {
                    fn(pt, 5)
                } else if (edgeLeft && edgeBottom) {
                    fn(pt, 6)
                } else if (edgeBottom && !edgeRight) {
                    fn(pt, 7)
                } else {
                    fn(pt, 8)
                }
            }
        }
    }
}

// TODO move these funcs

/**
 * @param slice the 9 parts to use to make a rectangle
 * @param pos top-left top-left position
 * @param dimensions dimensions of the desired rectangle in tile units
 * @return All the tiles instantiated. The first element in the list is the main transform, the rest are relative.
 */
export const makeNineSliceComponents = (slice: TileSource[], pos: Point, dimensions: Point): TileComponent[] => {
    if (slice.length !== 9) {
        throw new Error("nine slice gotta have nine slices ya dip")
    }
    if (dimensions.x < 2 || dimensions.y < 2) {
        throw new Error("9 slice must be at least 2x2")
    }
    const tiles: TileComponent[] = []
    tiles.push(slice[0].toComponent(new TileTransform(new Point(0, 0))))
    tiles.push(slice[2].toComponent(new TileTransform(new Point(dimensions.x - 1, 0))))
    tiles.push(slice[6].toComponent(new TileTransform(new Point(0, dimensions.y - 1))))
    tiles.push(slice[8].toComponent(new TileTransform(new Point(dimensions.x - 1, dimensions.y - 1))))
    // horizontal lines
    for (let i = 1; i < dimensions.x - 1; i++) {
        tiles.push(slice[1].toComponent(new TileTransform(new Point(i, 0))))
        tiles.push(slice[7].toComponent(new TileTransform(new Point(i, dimensions.y - 1))))
    }
    // vertical lines
    for (let j = 1; j < dimensions.y - 1; j++) {
        tiles.push(slice[3].toComponent(new TileTransform(new Point(0, j))))
        tiles.push(slice[5].toComponent(new TileTransform(new Point(dimensions.x - 1, j))))
    }
    // middle
    for (let x = 1; x < dimensions.x - 1; x++) {
        for (let y = 1; y < dimensions.y - 1; y++) {
            tiles.push(slice[4].toComponent(new TileTransform(new Point(x, y))))
        }
    }
    
    const mainTransform = tiles[0].transform
    tiles.forEach((c, i) => {
        c.transform.position = c.transform.position.times(tiles[0].transform.dimensions.x)
        if (i > 0) {
            c.transform.relativeTo(mainTransform)
        }
    })
    mainTransform.position = mainTransform.position.plus(pos)

    return tiles
}


/**
 * Same as makeNineSliceComponents, but will stretch the middle parts instead of tiling. 
 * This lets you make nine-slices whose dimensions aren't a multiple of the tile size.
 * @param slice the 9 parts to use to make a rectangle
 * @param pos top-left top-left position
 * @param dimensions dimensions of the desired rectangle in pixels. Should be at least TILE_SIZExTILE_SIZE
 * @return All the tiles instantiated. The first element in the list is the main transform, the rest are relative.
 */
export const makeStretchedNineSliceComponents = (slice: TileSource[], pos: Point, dimensions: Point): TileComponent[] => {
    if (slice.length !== 9) {
        throw new Error("nine slice gotta have nine slices ya dip")
    }
    // if (dimensions.x < 2 || dimensions.y < 2) {
        // throw new Error("9 slice must be at least 2x2")
    // }
    const tiles: TileComponent[] = []
    const topLeft = slice[0].toComponent(new TileTransform(new Point(0, 0)))
    const tileSize = topLeft.transform.dimensions.x

    // corners
    tiles.push(topLeft)
    tiles.push(slice[2].toComponent(new TileTransform(new Point(dimensions.x - tileSize, 0))))
    tiles.push(slice[6].toComponent(new TileTransform(new Point(0, dimensions.y - tileSize))))
    tiles.push(slice[8].toComponent(new TileTransform(new Point(dimensions.x - tileSize, dimensions.y - tileSize))))

    // horizontal lines
    const horizontalDimensions = new Point(dimensions.x-tileSize*2, tileSize)
    tiles.push(slice[1].toComponent(new TileTransform(new Point(tileSize, 0), horizontalDimensions)))
    tiles.push(slice[7].toComponent(new TileTransform(new Point(tileSize, dimensions.y - tileSize), horizontalDimensions)))

    // vertical lines
    const verticalDimensions = new Point(tileSize, dimensions.y-tileSize*2)
    tiles.push(slice[3].toComponent(new TileTransform(new Point(0, tileSize), verticalDimensions)))
    tiles.push(slice[5].toComponent(new TileTransform(new Point(dimensions.x - tileSize, tileSize), verticalDimensions)))

    // middle
    tiles.push(slice[4].toComponent(new TileTransform(new Point(tileSize, tileSize), new Point(dimensions.x-tileSize*2, dimensions.y-tileSize*2))))
    
    const mainTransform = tiles[0].transform
    tiles.forEach((c, i) => {
        if (i > 0) {
            c.transform.relativeTo(mainTransform)
        }
    })
    mainTransform.position = mainTransform.position.plus(pos)

    return tiles
}