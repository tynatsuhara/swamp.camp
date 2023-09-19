import { Component, debug, Entity, Point, UpdateData } from "brigsby/dist"
import { ImageRender } from "brigsby/dist/renderer"
import { isGamePaused } from "../../core/PauseState"
import { Singletons } from "../../core/Singletons"
import { Color, getRGB } from "../../ui/Color"

const MAX_PARTICLES = 4_000

export class Particles {
    static get instance() {
        return Singletons.getOrCreate(Particles)
    }

    private prefabs = new Map<Color, ImageBitmap>()
    private entity = new Entity()

    get count() {
        return this.entity.components.length
    }

    clear() {
        this.entity = new Entity()
    }

    emitComplexParticle(
        color: Color,
        positionSupplier: (t: number) => Point,
        depthSupplier: () => number,
        lifetime: number,
        velocity: (t: number) => Point = () => Point.ZERO,
        size: Point = new Point(1, 1)
    ) {
        if (isGamePaused()) {
            return
        }

        const emitFn = (image: ImageBitmap) =>
            this.entity.addComponent(
                Particle.dynamic(lifetime, image, positionSupplier, depthSupplier, velocity, size)
            )

        this.createParticle(emitFn, color)
    }

    emitParticle(
        color: Color,
        position: Point,
        depth: number,
        lifetime: number,
        velocity: (t: number) => Point = () => Point.ZERO,
        size: Point = new Point(1, 1)
    ) {
        if (isGamePaused()) {
            return
        }

        const emitFn = (image: ImageBitmap) =>
            this.entity.addComponent(Particle.new(lifetime, image, position, depth, velocity, size))

        this.createParticle(emitFn, color)
    }

    private createParticle(emitFn: (image: ImageBitmap) => void, color: Color) {
        if (debug.disableParticles) {
            return
        }

        const prefabBitmap = this.prefabs.get(color)
        if (prefabBitmap) {
            emitFn(prefabBitmap)
            return
        }

        // Generate and cache a bitmap. ImageBitmap is usable by
        // the GPU, whereas ImageData is only usable by the CPU.
        const rgba = [...getRGB(color), 255]
        const imageData = new ImageData(new Uint8ClampedArray(rgba), 1, 1)
        createImageBitmap(imageData).then((bitmap) => {
            this.prefabs.set(color, bitmap)
            emitFn(bitmap)
        })
    }

    getEntity() {
        return this.entity
    }
}

const SIZE = new Point(1, 1)

class Particle extends Component {
    private elapsedTime = 0

    private constructor(private readonly lifetime: number) {
        super()
    }

    update({ elapsedTimeMillis }: UpdateData): void {
        if (isGamePaused()) {
            return
        }

        this.elapsedTime += elapsedTimeMillis
        if (this.elapsedTime > this.lifetime || Particles.instance.count > MAX_PARTICLES) {
            this.delete()
        }
    }

    static new(
        lifetime: number,
        image: ImageBitmap,
        position: Point,
        depth: number,
        velocity: (t: number) => Point,
        size: Point = new Point(1, 1)
    ) {
        const p = new Particle(lifetime)
        p.getRenderMethods = () => [
            new ImageRender(
                image,
                Point.ZERO,
                SIZE,
                position.plus(velocity(p.elapsedTime)).apply(Math.round),
                size,
                depth
            ),
        ]
        return p
    }

    static dynamic(
        lifetime: number,
        image: ImageBitmap,
        positionSupplier: (t: number) => Point,
        depthSupplier: () => number,
        velocity: (t: number) => Point,
        size: Point = new Point(1, 1)
    ) {
        const p = new Particle(lifetime)
        p.getRenderMethods = () => [
            new ImageRender(
                image,
                Point.ZERO,
                SIZE,
                positionSupplier(p.elapsedTime).plus(velocity(p.elapsedTime)).apply(Math.round),
                size,
                depthSupplier()
            ),
        ]
        return p
    }
}
