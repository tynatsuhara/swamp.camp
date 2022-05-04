import { Singletons } from "../Singletons"
import { AbstractLocationGenerator, TreeTypeSupplier } from "./AbstractLocationGenerator"
import { ElementType } from "./elements/Elements"
import { Location } from "./Location"
import { LocationType } from "./LocationManager"

const MAP_SIZE = 30

export class RadiantLocationGenerator extends AbstractLocationGenerator {
    static get instance() {
        return Singletons.getOrCreate(RadiantLocationGenerator)
    }

    protected _generate(): Location {
        const levels = Math.random() > 0.7 ? undefined : this.levels(MAP_SIZE / 2)

        const location = new Location(LocationType.RADIANT, false, true, MAP_SIZE, levels)

        // make the ground
        this.placeGround(location)

        if (Math.random() > 0.3) {
            this.placeWater(location)
        }

        const treeType = this.getTreeTypeSupplier()
        this.spawnTreesAtEdge(location, treeType)
        this.spawnTrees(location, treeType)
        this.spawn(location, ElementType.ROCK, 5 + Math.random() * 5)
        this.spawn(location, ElementType.MUSHROOM, 3 + Math.random() * 5)

        return location
    }

    private getTreeTypeSupplier(): TreeTypeSupplier {
        const ratio = Math.random()
        return () => (Math.random() > ratio ? ElementType.TREE_POINTY : ElementType.TREE_ROUND)
    }
}
