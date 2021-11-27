import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { ImageRender } from "brigsby/dist/renderer/ImageRender"
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
        offsetSupplier: () => Point = () => Point.ZERO
    ) {
        const emit = (image: ImageBitmap) =>
            this.entity.addComponent(
                new Particle(image, position, depth, lifetime, velocity, size, offsetSupplier)
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
        createImageBitmap(imageData).then((bitmap) => {
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
    private elapsedTime = 0

    constructor(
        image: ImageBitmap,
        position: Point,
        depth: number,
        lifetime: number,
        velocity: (t: number) => Point,
        size: Point = new Point(1, 1),
        offsetSupplier: () => Point
    ) {
        super()

        this.update = (updateData) => {
            this.elapsedTime += updateData.elapsedTimeMillis
            if (this.elapsedTime > lifetime) {
                this.delete()
            }
        }

        this.getRenderMethods = () => [
            new ImageRender(
                image,
                Point.ZERO,
                SIZE,
                position.plus(velocity(this.elapsedTime)).plus(offsetSupplier()),
                size,
                depth
            ),
        ]
    }
}
