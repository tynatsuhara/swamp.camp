import { Lists } from "brigsby/dist/util/Lists"
import { VillagerJob } from "../../characters/ai/VillagerJob"
import { DudeFaction } from "../../characters/DudeFactory"
import { DudeType } from "../../characters/DudeType"
import { Villager } from "../../characters/types/Villager"
import { adjacent } from "../../utils/misc"
import { ConstructionSite } from "../buildings/ConstructionSite"
import { MineInterior } from "../buildings/MineInterior"
import { Elements } from "../elements/Elements"
import { ElementType } from "../elements/ElementType"
import { HittableResource } from "../elements/HittableResource"
import { GroundType } from "../ground/Ground"
import { camp, LocationManager } from "../locations/LocationManager"
import { LocationType } from "../locations/LocationType"
import { collectTaxes } from "../TaxRate"
import { Day } from "../TimeUnit"
import { WorldTime } from "../WorldTime"

// runs at midnight
export const doDailyEvents = () => {
    applyVillagerWork()
    replenishResources()
    spreadGrass()
}

// runs in the morning, once everyone is awake
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

    const villagersByJobCount: Partial<Record<VillagerJob, number>> = villagers.reduce(
        (obj, val) => {
            obj[val.job] ??= 0
            obj[val.job]++
            return obj
        },
        {}
    )

    // construction work
    const activeConstructionSitesByWorkerType: Partial<Record<VillagerJob, ConstructionSite[]>> =
        camp()
            .getElements()
            .map((e) => e.entity.getComponent(ConstructionSite))
            .filter((site) => site?.hasMaterials())
            .reduce((obj, val) => {
                obj[val.jobType] ??= []
                obj[val.jobType].push(val)
                return obj
            }, {})

    // apply mining work
    const miners = villagers.filter((v) => v.job === VillagerJob.MINE)
    const mines = LocationManager.instance
        .getLocations()
        .filter((l) => l.type === LocationType.MINE_INTERIOR)
    const mineDigSites = activeConstructionSitesByWorkerType[VillagerJob.MINE]?.length ?? 0
    const maxSquaresMinedPerMiner = 2
    if (miners.length > 0 && mines.length > 0) {
        const mineWorkRatio = mines.length / (mines.length + mineDigSites)
        for (let i = 0; i < miners.length * mineWorkRatio; i++) {
            MineInterior.expand(
                Lists.oneOf(mines),
                Math.ceil(Math.random() * maxSquaresMinedPerMiner)
            )
        }
    }
    // TODO collect mined resources (chest somewhere?)

    // apply construction progress — scales linearly by number of workers
    Object.keys(activeConstructionSitesByWorkerType).forEach((jobType) => {
        const workerCount = villagersByJobCount[jobType] ?? 0
        const sites: ConstructionSite[] = activeConstructionSitesByWorkerType[jobType]
        const hoursWorked = (workerCount / sites.length) * 24
        sites.forEach((site) => site.makeProgress(hoursWorked))
    })

    // apply wood collection
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
