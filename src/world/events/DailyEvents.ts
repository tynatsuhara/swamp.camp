import { Lists } from "brigsby/dist/util/Lists"
import { VillagerJob } from "../../characters/ai/VillagerJob"
import { DudeFaction } from "../../characters/DudeFactory"
import { DudeType } from "../../characters/DudeType"
import { Villager } from "../../characters/types/Villager"
import { adjacent } from "../../Utils"
import { ConstructionSite } from "../buildings/ConstructionSite"
import { Elements, ElementType } from "../elements/Elements"
import { HittableResource } from "../elements/HittableResource"
import { GroundType } from "../ground/Ground"
import { camp, LocationManager } from "../locations/LocationManager"
import { collectTaxes } from "../TaxRate"
import { Day } from "../TimeUnit"
import { WorldTime } from "../WorldTime"

export const doDailyEvents = () => {
    applyVillagerWork()
    replenishResources()
    spreadGrass()
}

export const doDailyMorningEvents = () => {
    if (WorldTime.instance.currentDay === Day.MONDAY) {
        collectTaxes()
    }

    updateTownStats()
}

const getAllVillagers = () =>
    LocationManager.instance
        .getLocations()
        .flatMap((l) => l.getDudes())
        .filter((d) => d.isAlive && d.factions.includes(DudeFaction.VILLAGERS))

const replenishResources = () => {
    camp()
        .getElements()
        .map((e) => e.entity.getComponent(HittableResource)?.replenish())

    const allSpots = camp().getAllGroundSpots()
    const spawnResource = (type: ElementType, count: number) => {
        const typeFactory = Elements.instance.getElementFactory(type)
        const openTiles = allSpots.filter(
            (tile) => !camp().isOccupied(tile) && typeFactory.canPlaceAtPos(camp(), tile)
        )
        for (let i = 0; i < count; i++) {
            camp().addElement(type, Lists.oneOf(openTiles))
        }
    }

    // Spawn new resources
    spawnResource(ElementType.ROCK, Math.random() * 5)
    spawnResource(ElementType.BLACKBERRIES, Math.random() * 3)
    spawnResource(ElementType.MUSHROOM, Math.round(Math.random()))
}

const updateTownStats = () => {
    const foodAmount = 0 // TODO
    const villagerCount = LocationManager.instance
        .getLocations()
        .flatMap((l) => l.getDudes())
        .filter((d) => d.isAlive && d.factions.includes(DudeFaction.VILLAGERS)).length
    // TODO calculate food amount
}

// TODO
const applyVillagerWork = () => {
    const villagers = getAllVillagers()
        .filter((v) => v.type === DudeType.VILLAGER)
        .map((v) => v.entity.getComponent(Villager))

    const constructionWorkers = villagers.filter((v) => v.job === VillagerJob.CONSTRUCTION)
    const activeConstructionSites = camp()
        .getElements()
        .map((e) => e.entity.getComponent(ConstructionSite))
        .filter((site) => site?.hasMaterials())
    // construction progress scales linearly by number of workers
    const hoursWorked = (constructionWorkers.length / activeConstructionSites.length) * 24
    activeConstructionSites.forEach((site) => site.makeProgress(hoursWorked))

    const miners = villagers.filter((v) => v.job === VillagerJob.MINE)
    // TODO make progress on mines, collect resources

    const lumberjacks = villagers.filter((v) => v.job === VillagerJob.HARVEST_WOOD)
    // TODO chop some trees, collect wood
}

const spreadGrass = () => {
    const l = camp()
    l.getAllGroundSpots()
        .filter((pt) => l.getGround(pt)?.type === GroundType.PATH)
        .map((pt) => {
            const adjacentGrass = adjacent(pt).filter(
                (adj) => l.getGround(adj)?.type === GroundType.GRASS
            ).length as 0 | 1 | 2 | 3 | 4

            return { pt, adjacentGrass }
        })
        .forEach(({ pt, adjacentGrass }) => {
            const likelyHoodOfSpread = 0.1 * adjacentGrass
            if (Math.random() < likelyHoodOfSpread) {
                l.setGroundElement(GroundType.GRASS, pt)
            }
        })
}
