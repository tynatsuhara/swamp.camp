import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/point"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { TextRender } from "../../engine/renderer/TextRender"
import { NineSlice } from "../../engine/tiles/NineSlice"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Camera } from "../cutscenes/Camera"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UIStateManager } from "./UIStateManager"

type Notification = {
    text: string,
    icon?: string,  // one-bit tile key
    isExpired?: () => boolean,
}

export class NotificationDisplay extends Component {

    static instance: NotificationDisplay

    private displayEntity: Entity
    private nEntities: Entity[] = []
    private notifications: Notification[] = []
    private renderDirty = true
    private offset = new Point(-4, 4)

    constructor() {
        super()
        NotificationDisplay.instance = this
        this.displayEntity = new Entity([this])
    }

    push(notification: Notification) {
        if (!notification.isExpired) {
            const expirationTime = Date.now() + 10_000
            notification.isExpired = () => Date.now() > expirationTime
        }
        this.notifications.push(notification)
        this.renderDirty = true
    }

    update(updateData: UpdateData) {
        if (this.notifications.some(n => n.isExpired())) {
            this.renderDirty = true
        }

        if (this.renderDirty) {
            this.notifications = this.notifications.filter(n => !n.isExpired())
            this.nEntities = this.notifications.map((n, i) => this.renderNotification(n, i))
        }
    }

    private renderNotification(n: Notification, index: number) {
        const textPixelWidth = n.text.length * TEXT_PIXEL_WIDTH
        const iconWidth = 20
        const width = textPixelWidth + TILE_SIZE + (!!n.icon ? iconWidth : 0)
        const height = TILE_SIZE * 2 - 2
        const pos = this.offset.plusX(Camera.instance.dimensions.x - width).plusY(32 * index)
        const textPos = pos.plusX(TILE_SIZE/2 + (!!n.icon ? iconWidth : 0)).plusY(height/2 - TEXT_SIZE/2 + .5)
        let icon = null
        if (!!n.icon) {
            icon = Tilesets.instance.oneBit.getTileSource(n.icon)
                    .filtered(ImageFilters.tint(Color.DARK_RED))
                    .toComponent(TileTransform.new({ 
                        position: textPos.plusY(-4).plusX(-iconWidth), 
                        depth: UIStateManager.UI_SPRITE_DEPTH + 1 
                    }))
        }

        const backgroundTiles = NineSlice.makeStretchedNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), 
            pos,
            new Point(width, height)
        )
        
        return new Entity([
            new BasicRenderComponent(
                new TextRender(n.text, textPos, TEXT_SIZE, TEXT_FONT, Color.DARK_RED, UIStateManager.UI_SPRITE_DEPTH + 1)
            ),
            icon,
            ...backgroundTiles
        ])
    }

    getEntities(): Entity[] {
        return [this.displayEntity].concat(this.nEntities)
    }
}