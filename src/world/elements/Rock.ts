import { Point } from "brigsby/dist/Point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Entity } from "brigsby/dist/Entity"
import { Item } from "../../items/Items"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { HittableResource } from "./HittableResource"
import { Player } from "../../characters/Player"
import { WeaponType } from "../../characters/weapons/WeaponType"
import { ElementFactory } from "./ElementFactory"
import { assets } from "brigsby/dist/Assets"
import { Lists } from "brigsby/dist/util/Lists"
import { Sounds } from "../../audio/Sounds"

const MINING_AUDIO = Lists.range(0, 5).map((n) => `audio/impact/impactMining_00${n}.ogg`)
const MINING_AUDIO_VOLUME = 0.4

export class RockFactory extends ElementFactory {
    readonly type = ElementType.ROCK
    readonly dimensions = new Point(1, 1)

    constructor() {
        super()
        assets.loadAudioFiles(MINING_AUDIO)
    }

    make(wl: WorldLocation, pos: Point, data: any): ElementComponent {
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
            new BoxCollider(
                pos
                    .plus(new Point(0.5, 1))
                    .times(TILE_SIZE)
                    .minus(new Point(hitboxDims.x / 2, hitboxDims.y + 2)),
                hitboxDims
            )
        )

        const hittableResource = e.addComponent(
            new HittableResource(
                pos.plus(new Point(0.5, 0.5)).times(TILE_SIZE),
                [tile.transform],
                availableResources,
                maxResourcesCount,
                () => {
                    if (Player.instance.dude.weaponType === WeaponType.PICKAXE) {
                        return Math.random() > 0.5 ? [Item.IRON] : [Item.ROCK]
                    } else {
                        return Math.random() > 0.9 ? [Item.IRON] : [Item.ROCK]
                    }
                },
                () => Sounds.play(Lists.oneOf(MINING_AUDIO), MINING_AUDIO_VOLUME)
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.ROCK, pos, [pos], () => {
                return {
                    v: variation,
                    m: mossy,
                    f: flipped,
                    a: hittableResource.freeResources,
                }
            })
        )
    }
}
