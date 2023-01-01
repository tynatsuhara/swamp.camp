import { debug, pt } from "brigsby/dist"
import { Grid, Lists } from "brigsby/dist/util"
import { getImage } from "../../graphics/Tilesets"
import { Singletons } from "../../Singletons"
import { Color, getHex } from "../../ui/Color"
import { ElementType } from "../elements/Elements"
import { GroundType } from "../ground/Ground"
import { AbstractLocationGenerator } from "./AbstractLocationGenerator"
import { Location } from "./Location"
import { LocationType } from "./LocationManager"

export const EAST_COAST_OCEAN_WIDTH = 12

/**
 * The map goes from [-MAP_RANGE, MAP_RANGE), although some of the grids extend
 * one tile further in each direction to prevent janky cutoffs at the edge
 */
const MAP_RANGE = 40
const MAP_SIZE = MAP_RANGE * 2

// Color mapping
const LEVEL_1_WATER = Color.BLUE_6
const LEVEL_2_WATER = Color.BLUE_5
const LEVEL_3_WATER = Color.BLUE_4
const LEVEL_1_GRASS = Color.GREEN_6
const LEVEL_2_GRASS = Color.GREEN_5
const LEVEL_3_GRASS = Color.GREEN_4
const LEVEL_1_TENT = Color.PINK_3
const LEVEL_2_TENT = Color.PINK_2
const LEVEL_3_TENT = Color.PINK_1

export class CampLocationGenerator extends AbstractLocationGenerator {
    static get instance() {
        return Singletons.getOrCreate(CampLocationGenerator)
    }

    private map: HTMLImageElement

    protected _generate() {
        const mapId = this.pickMap()
        console.log({ mapId })

        this.map = getImage(mapId)

        const colors = this.getColorGrid()
        const levels = this.createLevels(colors)

        const location = new Location(LocationType.BASE_CAMP, false, true, MAP_SIZE, levels)

        this.placeGround(location)
        this.addWater(location, colors)
        this.placeTent(location, colors)

        // essential elements
        location.addElement(ElementType.QUEEQUEG, pt(MAP_RANGE - 6, 10))

        this.spawnTreesAtEdge(location)
        this.spawnTrees(location)
        this.spawn(location, ElementType.ROCK, 15 + Math.random() * 10)
        this.spawn(location, ElementType.MUSHROOM, 3 + Math.random() * 5)
        this.spawn(location, ElementType.BLACKBERRIES, 5 + Math.random() * 5)
        // TODO short trees, really big trees, fallen trees, bushes, fruit, tall grass, reeds, etc

        return location
    }

    private pickMap() {
        const mapOptions = Object.keys(window.SWAMP_CAMP.assets).filter((path) =>
            path.startsWith(`images/maps/camp/map`)
        )

        if (debug.forceMapId) {
            return mapOptions.find((mapFile) => mapFile.includes(debug.forceMapId))
        }

        const mapsKey = "maps"
        let exclude: Set<string> = new Set<string>(JSON.parse(localStorage.getItem(mapsKey)) ?? [])

        // They've seen all maps, so just pick one
        if (exclude.size === mapOptions.length) {
            return Lists.oneOf(mapOptions)
        }

        // Add it to the serialized set to avoid regenerating this map again
        const mapId = Lists.oneOf(mapOptions.filter((id) => !exclude.has(id)))
        exclude.add(mapId)
        localStorage.setItem(mapsKey, JSON.stringify(Array.from(exclude)))
        return mapId
    }

    private placeTent(location: Location, colors: Grid<Color>) {
        // sorted from top-left to bottom-right
        const tentSpots = colors
            .entries()
            .filter(([point, color]) => [LEVEL_1_TENT, LEVEL_2_TENT, LEVEL_3_TENT].includes(color))
            .map(([point]) => point)
            .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x))

        if (tentSpots.length === 0) {
            throw new Error("no tent spot found")
        }

        const tentPos = tentSpots[0].plusX(3)
        location.addElement(ElementType.TENT, tentPos, {
            color: "red",
        })
    }

    private createLevels(colors: Grid<Color>): Grid<number> {
        return colors.map((color) => {
            if ([LEVEL_1_GRASS, LEVEL_1_WATER, LEVEL_1_TENT].includes(color)) {
                return 0
            } else if ([LEVEL_2_GRASS, LEVEL_2_WATER, LEVEL_2_TENT].includes(color)) {
                return 1
            } else if ([LEVEL_3_GRASS, LEVEL_3_WATER, LEVEL_3_TENT].includes(color)) {
                return 2
            }
            console.log(`${color} is not a valid map color`)
        })
    }

    private addWater(location: Location, colors: Grid<Color>) {
        colors.entries().forEach(([pt, color]) => {
            if ([LEVEL_1_WATER, LEVEL_2_WATER, LEVEL_3_WATER].includes(color)) {
                location.setGroundElement(GroundType.WATER, pt)
            }
        })
    }

    private getColorGrid(): Grid<Color> {
        const { width, height } = this.map
        if (width !== MAP_SIZE + 2 || height !== MAP_SIZE + 2) {
            console.error("invalid map size!")
        }

        // draw image to canvas to translate to imageData
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext("2d", { alpha: false })
        context.imageSmoothingEnabled = false
        context.drawImage(this.map, 0, 0, width, height, 0, 0, width, height)
        const imageData = context.getImageData(0, 0, width, height)

        // parse pixel colors
        const grid = new Grid<Color>()
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const i = (x + y * width) * 4
                const hex = getHex(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2])
                grid.set(pt(x - width / 2, y - height / 2), hex as Color)
            }
        }

        return grid
    }
}
