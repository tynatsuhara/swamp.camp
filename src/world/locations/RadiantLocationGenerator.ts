import { Singletons } from "../../Singletons"
import { ElementType } from "../elements/Elements"
import { AbstractLocationGenerator, TreeTypeSupplier } from "./AbstractLocationGenerator"
import { Location } from "./Location"
import { LocationType } from "./LocationManager"

const MAP_SIZE = 30

/**
 * Radiant location ideas:
 *   - Orc camp with enslaved villagers and/or treasure
 *   - Gnoll camp — Will sell you enslaved elves? Or you can attack and free them
 *   - Centaur settlement
 *   - Elf settlement
 *   - Forest guardian with treasure
 *   - Troll with treasure
 *   - Ambush?
 *   - Misc wildlife
 *   - Abundance of natural resources
 */

export class RadiantLocationGenerator extends AbstractLocationGenerator {
    static get instance() {
        return Singletons.getOrCreate(RadiantLocationGenerator)
    }

    protected _generate(): Location {
        const levels =
            Math.random() > 0.7
                ? undefined
                : this.levels(MAP_SIZE / 2, true, Math.ceil(Math.random() > 0.7 ? 3 : 2))

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
