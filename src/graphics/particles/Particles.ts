import { Component, debug, Entity, Point, UpdateData } from "brigsby/dist"
import { ImageRender } from "brigsby/dist/renderer"
import { isGamePaused } from "../../core/PauseState"
import { Singletons } from "../../core/Singletons"
import { Color, getRGB } from "../../ui/Color"

const MAX_PARTICLES = 4_000
// if we hit MAX_PARTICLES, start expiring early until we have this many particles in the inactive pool
const PARTICLE_BUFFER_SIZE = 200

let particleSystemEntity: Entity
let inactivePool: Particle[]

export class Particles {
    static get instance() {
        return Singletons.getOrCreate(Particles)
    }

    private prefabs = new Map<Color, ImageBitmap>()

    get count() {
        return particleSystemEntity.components.length
    }
    get inactiveCount() {
        return inactivePool.length
    }

    constructor() {
        this.clear()
    }

    clear() {
        particleSystemEntity = new Entity()
        inactivePool = []
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
            Particle.dynamic(lifetime, image, positionSupplier, depthSupplier, velocity, size)

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
            Particle.new(lifetime, image, position, depth, velocity, size)

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
        return particleSystemEntity
    }
}

const SIZE = new Point(1, 1)

class Particle extends Component {
    lifetime: number
    elapsedTime: number

    update({ elapsedTimeMillis }: UpdateData): void {
        if (isGamePaused()) {
            return
        }

        this.elapsedTime += elapsedTimeMillis

        if (
            this.elapsedTime > this.lifetime ||
            // expire early
            (Particles.instance.count >= MAX_PARTICLES &&
                inactivePool.length < PARTICLE_BUFFER_SIZE)
        ) {
            this.enabled = false
            inactivePool.push(this)
        }
    }

    private static createParticle(lifetime: number) {
        let p: Particle
        if (inactivePool.length > 0) {
            p = inactivePool.pop()
        } else {
            p = new Particle()
            particleSystemEntity.addComponent(p)
        }
        p.enabled = true
        p.lifetime = lifetime
        p.elapsedTime = 0
        return p
    }

    static new(
        lifetime: number,
        image: ImageBitmap,
        position: Point,
        depth: number,
        velocity: (t: number) => Point,
        size: Point = new Point(1, 1)
    ) {
        const p = this.createParticle(lifetime)
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
    }

    static dynamic(
        lifetime: number,
        image: ImageBitmap,
        positionSupplier: (t: number) => Point,
        depthSupplier: () => number,
        velocity: (t: number) => Point,
        size: Point = new Point(1, 1)
    ) {
        const p = this.createParticle(lifetime)
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
    }
}
