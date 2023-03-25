import { Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { loadAudio } from "../../audio/DeferLoadAudio"
import { Sounds } from "../../audio/Sounds"
import { WeaponType } from "../../characters/weapons/WeaponType"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Item"
import { Ground } from "../ground/Ground"
import { Location } from "../locations/Location"
import { camp } from "../locations/LocationManager"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { HittableResource } from "./HittableResource"
import { NavMeshCollider } from "./NavMeshCollider"

const MINING_AUDIO = loadAudio(Lists.range(0, 5).map((n) => `audio/impact/impactMining_00${n}.ogg`))
const MINING_AUDIO_VOLUME = 0.4

export const playMiningSound = (centerPos: Point) =>
    Sounds.playAtPoint(Lists.oneOf(MINING_AUDIO), MINING_AUDIO_VOLUME, centerPos)

export class RockFactory extends ElementFactory<ElementType.ROCK> {
    readonly dimensions = new Point(1, 1)

    constructor() {
        super(ElementType.ROCK)
    }

    make(wl: Location, pos: Point, data: any): ElementComponent<ElementType.ROCK> {
        const e = new Entity()
        const variation = data.v ?? Math.floor(Math.random() * 3) + 1
        const mossy = data.m ?? Math.random() > 0.7
        const flipped = data.f ?? Math.random() > 0.5
        const maxResourcesCount = 6
        const availableResources = data.a ?? maxResourcesCount

        const tile = e.addComponent(
            new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource(
                    `rock${variation}${mossy ? "mossy" : ""}`
                ),
                new SpriteTransform(pos.times(TILE_SIZE))
            )
        )
        tile.transform.depth = (pos.y + 1) * TILE_SIZE - /* prevent weapon from clipping */ 5
        tile.transform.mirrorX = flipped

        const hitboxDims = new Point(12, 4)
        e.addComponent(
            new NavMeshCollider(
                wl,
                pos
                    .plus(new Point(0.5, 1))
                    .times(TILE_SIZE)
                    .minus(new Point(hitboxDims.x / 2, hitboxDims.y + 2)),
                hitboxDims
            )
        )

        const centerPos = pos.plus(new Point(0.5, 0.5)).times(TILE_SIZE)

        const hittableResource = e.addComponent(
            new HittableResource(
                centerPos,
                [tile.transform],
                availableResources,
                maxResourcesCount,
                (dude) => {
                    if (dude.weaponType === WeaponType.PICKAXE) {
                        return Math.random() > 0.5 ? [Item.IRON] : [Item.ROCK]
                    } else {
                        return Math.random() > 0.9 ? [Item.IRON] : [Item.ROCK]
                    }
                },
                () => playMiningSound(centerPos),
                () => {}
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.ROCK, pos, () => {
                return {
                    v: variation,
                    m: mossy,
                    f: flipped,
                    a: hittableResource.availableResources,
                }
            })
        )
    }

    canPlaceInLocation(wl: Location) {
        return wl === camp()
    }

    canPlaceAtPos(wl: Location, pos: Point) {
        return Ground.isNaturalGround(wl.getGround(pos)?.type)
    }
}
