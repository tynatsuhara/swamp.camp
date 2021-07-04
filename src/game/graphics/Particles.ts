import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Singletons } from "../Singletons"
import { Color, getRGB } from "../ui/Color"

export class Particles {
    static get instance() {
        return Singletons.getOrCreate(Particles)
    }

    private prefabs = new Map<Color, ImageBitmap>()
    private entity = new Entity()

    clear() {
        this.entity = new Entity()
    }

    emitParticle(
        color: Color, 
        position: Point, 
        depth: number, 
        lifetime: number,
        velocity: (t: number) => Point = () => Point.ZERO,
        size: Point = new Point(1, 1),
    ) {
        const emit = (image: ImageBitmap) => this.entity.addComponent(
            new Particle(image, position, depth, lifetime, velocity, size)
        )

        const prefabBitmap = this.prefabs.get(color)
        if (prefabBitmap) {
            emit(prefabBitmap)
            return
        }

        // Generate and cache a bitmap. ImageBitmap is usable by 
        // the GPU, whereas ImageData is only usable by the CPU.
        const rgba = [...getRGB(color), 255]
        const imageData = new ImageData(new Uint8ClampedArray(rgba), 1, 1)
        createImageBitmap(imageData).then(bitmap => {
            this.prefabs.set(color, bitmap)
            emit(bitmap)
        })
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
    private readonly lifetime: number
    private readonly velocity: (t: number) => Point
    private readonly size: Point

    private elapsedTime = 0

    constructor(
        image: ImageBitmap, 
        position: Point, 
        depth: number, 
        lifetime: number,
        velocity: (t: number) => Point,
        size: Point = new Point(1, 1),
    ) {
        super()
        this.image = image
        this.position = position
        this.depth = depth
        this.lifetime = lifetime
        this.velocity = velocity
        this.size = size
    }

    update(updateData: UpdateData) {
        this.elapsedTime += updateData.elapsedTimeMillis
        if (this.elapsedTime > this.lifetime) {
            this.delete()
        }
    }

    getRenderMethods() {
        return [
            new ImageRender(
                this.image, 
                Point.ZERO, 
                SIZE, 
                this.position.plus(this.velocity(this.elapsedTime)), 
                this.size, 
                this.depth
            )
        ]
    }
}