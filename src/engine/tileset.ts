import { Point } from "./point"
import { Entity } from "./entity"
import { ImageRender } from "./renderer/ImageRender"
import { UpdateData } from "./engine"
import { Component } from "./component"

// TODO: audit encapsulation of all these classes

export class TileSet {
    image: HTMLImageElement
    tileSize: number
    padding: number

    constructor(
        image: HTMLImageElement, 
        tileSize: number,
        padding: number = 0
    ) {
        this.image = image
        this.tileSize = tileSize
        this.padding = padding
    }
}

export class TileTransform {
    position: Point
    rotation: number
    scale: number
    mirrorX: boolean
    mirrorY: boolean
}

export class TileSource {
    tileSet: TileSet
    tileSetIndex: Point

    /**
     * Constructs a static tile source
     */
    constructor(
        tileSet: TileSet,
        tileSetIndex: Point
    ) {
        this.tileSet = tileSet
        this.tileSetIndex = tileSetIndex
    }

    toRenderImage(transform: TileTransform) {
        return new ImageRender(
            this.tileSet.image,
            new Point(
                this.tileSetIndex.x, 
                this.tileSetIndex.y
            ).times(this.tileSet.tileSize + this.tileSet.padding),
            new Point(this.tileSet.tileSize, this.tileSet.tileSize),
            transform.position,
            transform.rotation,
            transform.scale,
            transform.mirrorX,
            transform.mirrorY
        )
    }
}

/**
 * Represents a static (non-animated) tile entity
 */
export class TileComponent extends Component {
    tileSource: TileSource
    transform: TileTransform = new TileTransform()

    constructor(
        tileSource: TileSource,
        position: Point = new Point(0, 0)
    ) {
        super()
        this.tileSource = tileSource
        this.transform.position = position
    }

    getRenderMethods(): ImageRender[] {
        return [this.tileSource.toRenderImage(this.transform)]
    }
}

export class TileSetAnimation {
    frames: [TileSource, number][]  // a list of (source, end-of-frame timestamp)
    duration: number
    
    /**
     * @param frames A list of tile sources and a duration in milliseconds that each one will last
     */
    constructor(frames: [TileSource, number][]) {
        this.frames = []
        let timestamp = 0
        frames.forEach((frame: [TileSource, number]) => {
            timestamp += frame[1]
            this.frames.push([frame[0], timestamp])
        })
        this.duration = timestamp
    }
}

class TileSetAnimator {
    animation: TileSetAnimation
    time: number = 0
    index: number = 0

    constructor(animation: TileSetAnimation) {
        this.animation = animation
    }

    update(elapsedTimeMillis: number) {
        this.time += elapsedTimeMillis
        while (this.time > this.animation.frames[this.index][1]) {
            this.index++
            this.index %= this.animation.frames.length
            this.time %= this.animation.duration
        }
        return this.getCurrentTileSource()
    }

    getCurrentTileSource() {
        return this.animation.frames[this.index][0]
    }
}

export class AnimatedTileComponent extends TileComponent {
    animator: TileSetAnimator

    constructor(
        animation: TileSetAnimation,
        position: Point = new Point(0, 0)
    ) {
        const animator = new TileSetAnimator(animation)
        super(animator.getCurrentTileSource(), position)
        this.animator = animator
    }

    update(updateData: UpdateData) {
        this.tileSource = this.animator.update(updateData.elapsedTimeMillis)
    }
}
