import { Singletons } from "../Singletons"
import { AbstractLocationGenerator } from "./AbstractLocationGenerator"
import { ElementType } from "./elements/Elements"
import { Location } from "./Location"
import { LocationType } from "./LocationManager"

const MAP_SIZE = 40

export class RadiantLocationGenerator extends AbstractLocationGenerator {
    static get instance() {
        return Singletons.getOrCreate(RadiantLocationGenerator)
    }

    protected _generate(): Location {
        const levels = this.levels(MAP_SIZE / 2)

        const location = new Location(LocationType.RADIANT, false, true, MAP_SIZE, levels)

        // make the ground
        this.placeGround(location)
        this.placeWater(location)
        this.spawnTreesAtEdge(location)
        this.spawnTrees(location)
        this.spawn(location, ElementType.ROCK, 5 + Math.random() * 5)
        this.spawn(location, ElementType.MUSHROOM, 3 + Math.random() * 5)

        return location
    }
}
