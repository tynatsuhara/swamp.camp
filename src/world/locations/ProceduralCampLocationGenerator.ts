import { Point } from "brigsby/dist"
import { Grid, Noise } from "brigsby/dist/util"
import { Singletons } from "../../Singletons"
import { ElementType } from "../elements/Elements"
import { Ground, GroundType } from "../ground/Ground"
import { AbstractLocationGenerator } from "./AbstractLocationGenerator"
import { BasicLocation } from "./BasicLocation"
import { EAST_COAST_OCEAN_WIDTH } from "./CampLocationGenerator"
import { Location } from "./Location"
import { LocationType } from "./LocationType"

const COAST_VARIABILITY = 3
const COAST_OCEAN_WIDTH = EAST_COAST_OCEAN_WIDTH
// Represents the granularity of levels/coast variation.
// Should be divisible by 2 and a divisor of MAP_SIZE.
const SQ = 2

export class ProceduralCampLocationGenerator extends AbstractLocationGenerator {
    static get instance() {
        return Singletons.getOrCreate(ProceduralCampLocationGenerator)
    }

    private static readonly MAP_RANGE = 40
    /**
     * The map goes from [-MAP_RANGE, MAP_RANGE), although some of the grids extend
     * one tile further in each direction to prevent janky cutoffs at the edge
     */
    private static readonly MAP_SIZE = ProceduralCampLocationGenerator.MAP_RANGE * 2

    private readonly TENT_POS = new Point(-3, -3)

    protected _generate(): Promise<Location> {
        let location: Location

        for (let elementsPlaced = false, attempt = 1; !elementsPlaced; attempt++) {
            console.log(`generation attept ${attempt}`)

            const [coastNoise] = ProceduralCampLocationGenerator.coastNoise()
            const levels = this.levels(ProceduralCampLocationGenerator.MAP_RANGE)

            location = new BasicLocation({
                type: LocationType.BASE_CAMP,
                isInterior: false,
                allowPlacing: true,
                size: ProceduralCampLocationGenerator.MAP_SIZE,
                levels,
            })

            // make the ground
            this.placeGround(location)
            this.placeWater(location, coastNoise)

            // spawn tent
            const tent = location.addElement(ElementType.TENT, this.TENT_POS, {
                color: "red",
            })

            // if the tent couldn't be placed, redo the map topography
            elementsPlaced = !!tent
        }

        this.spawnTreesAtEdge(location)
        this.spawnTrees(location)

        this.spawn(location, ElementType.ROCK, 15 + Math.random() * 10)
        this.clearPathToCenter(location)

        // TODO short trees, bushes, fruit, tall grass, etc
        this.spawn(location, ElementType.MUSHROOM, 3 + Math.random() * 5)

        location.addElement(
            ElementType.QUEEQUEG,
            new Point(ProceduralCampLocationGenerator.MAP_RANGE - 6, 10)
        )

        return Promise.resolve(location)
    }

    private clearPathToCenter(location: Location) {
        const typesToClear = [ElementType.ROCK, ElementType.TREE_POINTY, ElementType.TREE_ROUND]

        // clear in corner
        for (
            let x = ProceduralCampLocationGenerator.MAP_RANGE - 11;
            x < ProceduralCampLocationGenerator.MAP_RANGE + 10;
            x++
        ) {
            for (
                let y = ProceduralCampLocationGenerator.MAP_RANGE - 25;
                y < ProceduralCampLocationGenerator.MAP_RANGE - 23;
                y++
            ) {
                const element = location.getElement(new Point(x, y))
                if (!!element && typesToClear.indexOf(element.type) !== -1) {
                    location.removeElementLocally(element)
                }
            }
        }

        // clear around tent
        const clearingCorner = this.TENT_POS.minus(new Point(1, 0))
        for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 4; y++) {
                const element = location.getElement(clearingCorner.plus(new Point(x, y)))
                if (!!element && typesToClear.indexOf(element.type) !== -1) {
                    location.removeElementLocally(element)
                }
            }
        }
    }

    addRiver(location: Location) {
        const start = new Point(10, 30)
        const end = new Point(-30, -30)
        const heuristicRandomness = 50

        const adjacent = (pt: Point) => [pt.plusX(1), pt.plusX(-1), pt.plusY(1), pt.plusY(-1)]
        const adjacentLevels = (pt: Point) => adjacent(pt).map((pt) => location.getLevel(pt))

        const river = location.findPath(
            start,
            end,
            (pt, goal) => pt.distanceTo(goal) + Math.random() * heuristicRandomness,
            (pt) => {
                const level = location.getLevel(pt)
                // for waterfalls to not happen on corners, at least 3 adjacent squares need to be the same level
                return adjacentLevels(pt).filter((l) => l === level).length < 3
            },
            // TODO: exclude weird corner case
            (pt) =>
                adjacent(pt).some((p) => Ground.isWater(location.getGround(p)?.type))
                    ? 1
                    : 1 + Math.random()
        )

        river.forEach((pt) => {
            const level = location.getLevel(pt)
            location.setGroundElement(
                adjacentLevels(pt).filter((l) => l < level).length === 1
                    ? GroundType.WATERFALL
                    : GroundType.WATER,
                pt
            )
        })

        // TODO: This logic might not be correct anymore, but it's not being used so it's okay

        river.forEach((pt) => {
            if (location.getGround(pt)?.type === GroundType.WATERFALL) {
                if (
                    location.getGround(pt.plusY(-1))?.type === GroundType.WATER ||
                    location.getGround(pt.plusY(1))?.type === GroundType.WATER
                ) {
                    location.setGroundElement(GroundType.WATER, pt.plusY(-1))
                    location.setGroundElement(GroundType.WATER, pt.plusY(1))
                } else {
                    location.setGroundElement(GroundType.WATER, pt.plusX(-1))
                    location.setGroundElement(GroundType.WATER, pt.plusX(1))
                }
            }
        })
    }

    // TODO scale like we do with levels
    static coastNoise(noiseScale: number = 0.5, seed = Math.random()): [Grid<boolean>, string] {
        const noise = new Noise(seed)

        const pts: Grid<boolean> = new Grid()
        let str = `seed: ${seed} \n`

        for (
            let y = -ProceduralCampLocationGenerator.MAP_RANGE - 1;
            y < ProceduralCampLocationGenerator.MAP_RANGE + 1;
            y += SQ
        ) {
            // [0, COAST_VARIABILITY)
            var value = Math.floor(
                ((noise.simplex2(0, y / (this.MAP_RANGE * noiseScale)) + 1) / 2) *
                    (COAST_VARIABILITY + 1)
            )

            for (let i = 0; i < COAST_OCEAN_WIDTH; i++) {
                if (i < value) {
                    str += "X"
                } else {
                    str += " "
                    for (let j = 0; j < SQ; j++) {
                        pts.set(
                            new Point(
                                ProceduralCampLocationGenerator.MAP_RANGE -
                                    COAST_OCEAN_WIDTH +
                                    i +
                                    1,
                                y + j
                            ),
                            true
                        )
                    }
                }
            }

            str += "\n"
        }

        return [pts, str]
    }
}
