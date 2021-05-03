import { assets } from "../../engine/Assets"
import { Point } from "../../engine/Point"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"
import { Lists } from "../../engine/util/Lists"

export enum ExplosionSize {
    LARGE_2 = 30,
    MEDIUM_2 = 28,
    SMALL_2 = 24
}

export class ExplosionTileset {
    getAnimation(size: ExplosionSize, onFinish: () => void): TileSetAnimation {
        // TODO: don't hardcode these when we need to support other sizes
        const col = 376
        const row = 49
        const space = 4
        const speed = 65

        const pos = new Point(col, row)
        return new TileSetAnimation(
            Lists.range(0, 4)
                    .map((index) => this.getTileAt(pos.plusX((size + space) * (index)), size))
                    .map(tileSource => [tileSource, speed]),
            onFinish
        )
    }

    private getTileAt(pos: Point, size: number) {
        return new StaticTileSource(
            this.image(), 
            pos,
            new Point(size, size)
        )
    }

    private image() {
        return assets.getImageByFileName("images/explosions.png")
    }
}