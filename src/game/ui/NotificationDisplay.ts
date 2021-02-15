import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/point"
import { TextRender } from "../../engine/renderer/TextRender"
import { NineSlice } from "../../engine/tiles/NineSlice"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Camera } from "../cutscenes/Camera"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UIStateManager } from "./UIStateManager"

const OFFSET = new Point(-4, 4)
const ICON_WIDTH = 20

type Notification = {
    text: string,
    icon?: string,  // one-bit tile key
    isExpired?: () => boolean,
}

class NotificationComponent extends Component {

    readonly n: Notification
    private t: TileTransform
    private width: number
    private height: number

    constructor(n: Notification) {
        super()
        this.n = n

        this.awake = () => {
            const textPixelWidth = n.text.length * TEXT_PIXEL_WIDTH
            this.width = textPixelWidth + TILE_SIZE + (!!n.icon ? ICON_WIDTH : 0)
            this.height = TILE_SIZE * 2 - 2
            const pos = this.getPositon()
    
            const backgroundTiles = NineSlice.makeStretchedNineSliceComponents(
                Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), 
                pos,
                new Point(this.width, this.height)
            )
            backgroundTiles.forEach(c => this.entity.addComponent(c))
            this.t = backgroundTiles[0].transform
    
            if (!!n.icon) {
                const icon = Tilesets.instance.oneBit.getTileSource(n.icon)
                        .filtered(ImageFilters.tint(Color.DARK_RED))
                        .toComponent(TileTransform.new({ 
                            position: new Point(TILE_SIZE/2, 7), 
                            depth: UIStateManager.UI_SPRITE_DEPTH + 1 
                        }).relativeTo(this.t))
                this.entity.addComponent(icon)
            }
        }
    }

    update(updateData: UpdateData) {
        this.t.position = this.getPositon(updateData.elapsedTimeMillis)
    }

    getRenderMethods() {
        const textPos = this.t.position.plusX(TILE_SIZE/2 + (!!this.n.icon ? ICON_WIDTH : 0)).plusY(this.height/2 - TEXT_SIZE/2 + .5)
        return [
            new TextRender(this.n.text, textPos, TEXT_SIZE, TEXT_FONT, Color.DARK_RED, UIStateManager.UI_SPRITE_DEPTH + 1)
        ]
    }

    isOffScreen() {
        return this.t.position.x > Camera.instance.dimensions.x
    }

    private getPositon(elapsedMillis = 0) {
        const index = NotificationDisplay.instance.getNotifications().indexOf(this.n)
        const yOffset = 32 * index + OFFSET.y
        const offScreenPos = new Point(Camera.instance.dimensions.x + 10, yOffset)
        const onScreenPos = new Point(Camera.instance.dimensions.x - this.width + OFFSET.x, yOffset)
        const goalPosition = this.n.isExpired() ? offScreenPos : onScreenPos

        if (!this.t) {
            return offScreenPos
        }

        const speed = .5 * elapsedMillis
        const diff = goalPosition.minus(this.t.position)
        if (diff.magnitude() < speed) {
            return goalPosition
        } else {
            return this.t.position.plus(diff.normalized().times(speed))
        }
    }
}

export class NotificationDisplay extends Component {

    static instance: NotificationDisplay

    private displayEntity: Entity
    private nComponents: NotificationComponent[] = []

    constructor() {
        super()
        NotificationDisplay.instance = this
        this.displayEntity = new Entity([this])
    }

    push(notification: Notification) {
        if (!notification.isExpired) {
            const expirationTime = Date.now() + 7_000
            notification.isExpired = () => Date.now() > expirationTime
        }
        const component = new NotificationComponent(notification)
        this.nComponents.push(component)
        new Entity([component])
    }

    update(updateData: UpdateData) {
        this.nComponents = this.nComponents.filter(n => !(n.isOffScreen() && n.n.isExpired()))
    }

    getNotifications() {
        return this.nComponents.map(nc => nc.n)
    }

    getEntities(): Entity[] {
        return [this.displayEntity].concat(this.nComponents.map(c => c.entity))
    }
}