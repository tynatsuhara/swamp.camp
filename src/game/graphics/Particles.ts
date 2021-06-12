import { Component } from "../../engine/Component"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Singletons } from "../Singletons"
import { Color, getRGB } from "../ui/Color"
import { UIStateManager } from "../ui/UIStateManager"
import { WorldTime } from "../world/WorldTime"

export class Particles {
    static get instance() {
        return Singletons.getOrCreate(Particles)
    }

    private prefabs = new Map<Color, ImageBitmap>()
    private entity = new Entity()

    emitParticle(color: Color, position: Point, depth: number, lifetime: number) {
        const prefabBitmap = this.prefabs.get(color)
        if (!prefabBitmap) {
            // Generate and cache a bitmap. ImageBitmap is usable by 
            // the GPU, whereas ImageData is only usable by the CPU.
            const rgba = [...getRGB(color), 255]
            const imageData = new ImageData(new Uint8ClampedArray(rgba), 1, 1)
            createImageBitmap(imageData).then(bitmap => {
                this.prefabs.set(color, bitmap)
                this.create(bitmap, position, depth, lifetime)
            })
        } else {
            this.create(prefabBitmap, position, depth, lifetime)
        }
    }

    private create(image: ImageBitmap, position: Point, depth: number, lifetime: number) {
        this.entity.addComponent(
            new Particle(image, position, depth, WorldTime.instance.time + lifetime)
        )
    }

    getEntity() {
        return this.entity
    }
}

const SIZE = new Point(1, 1)

class Particle extends Component {

    private readonly image: ImageBitmap
    private readonly position: Point
    private readonly depth: number
    private readonly expiration: number

    constructor(image: ImageBitmap, position: Point, depth: number, expiration: number) {
        super()
        this.image = image
        this.position = position
        this.depth = depth
        this.expiration = expiration
    }

    update() {
        if (WorldTime.instance.time > this.expiration) {
            this.delete()
        }
    }

    getRenderMethods() {
        return [
            new ImageRender(this.image, Point.ZERO, SIZE, this.position, SIZE, this.depth)
        ]
    }
}