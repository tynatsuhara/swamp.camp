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

    createParticle(color: Color, position: Point, lifetime: number) {
        const prefabBitmap = this.prefabs.get(color)
        if (!prefabBitmap) {
            // Generate and cache a bitmap. ImageBitmap is usable by 
            // the GPU, whereas ImageData is only usable by the CPU.
            const rgba = [...getRGB(color), 255]
            const imageData = new ImageData(new Uint8ClampedArray(rgba), 1, 1)
            createImageBitmap(imageData).then(bitmap => {
                this.prefabs.set(color, bitmap)
                this.create(bitmap, position, lifetime)
            })
        } else {
            this.create(prefabBitmap, position, lifetime)
        }
    }

    private create(image: ImageBitmap, position: Point, lifetime: number) {
        this.entity.addComponent(new Particle(image, position, WorldTime.instance.time + lifetime))
    }

    getEntity() {
        return this.entity
    }
}

const SIZE = new Point(1, 1)
const DEPTH = UIStateManager.UI_SPRITE_DEPTH/2

class Particle extends Component {

    private readonly image: ImageBitmap
    private readonly position: Point
    private readonly expiration: number

    constructor(image: ImageBitmap, position: Point, expiration: number) {
        super()
        this.image = image
        this.position = position
        this.expiration = expiration
    }

    update() {
        if (WorldTime.instance.time > this.expiration) {
            this.delete()
        }
    }

    getRenderMethods() {
        return [
            new ImageRender(this.image, Point.ZERO, SIZE, this.position, SIZE, DEPTH)
        ]
    }
}