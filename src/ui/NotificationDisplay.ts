import { Component, Entity, Point, UpdateData } from "brigsby/dist"
import { TextRender } from "brigsby/dist/renderer"
import { NineSlice, SpriteTransform } from "brigsby/dist/sprites"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { ImageFilters } from "../graphics/ImageFilters"
import { Icon } from "../graphics/OneBitTileset"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UIStateManager } from "./UIStateManager"

export const Notifications: { [key: string]: Notification } = {
    NEW_VILLAGER: { text: "Someone has arrived!", icon: "personsingle" },
}

const OFFSET = new Point(-4, 4)
const ICON_WIDTH = 20
const DEFAULT_LIFESPAN_MILLIS = 5_000

export type Notification = {
    text: string
    icon: Icon // one-bit tile key
    isExpired?: () => boolean // default behavior is to expire after DEFAULT_LIFESPAN_MILLIS
    id?: string // for lookups
    count?: number // used for inv push notification
}

class NotificationComponent extends Component {
    readonly data: Notification
    private t: SpriteTransform
    private width: number
    private height: number
    get position() {
        return this.t.position
    }

    constructor(data: Notification, initialPos?: Point) {
        super()
        if (!data.isExpired) {
            const expirationTime = Date.now() + DEFAULT_LIFESPAN_MILLIS
            data.isExpired = () => Date.now() > expirationTime
        }
        this.data = data

        this.awake = () => {
            const textPixelWidth = data.text.length * TEXT_PIXEL_WIDTH
            this.width = textPixelWidth + TILE_SIZE + (!!data.icon ? ICON_WIDTH : 0)
            this.height = TILE_SIZE * 2 - 2
            const position = initialPos ?? this.getPosition()
            const depth = UIStateManager.UI_SPRITE_DEPTH + 19

            const { transform, sprites } = NineSlice.makeStretchedNineSliceComponents(
                Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"),
                new Point(this.width, this.height),
                { position, depth }
            )
            sprites.forEach((c) => this.entity.addComponent(c))
            this.t = transform

            if (!!data.icon) {
                const icon = Tilesets.instance.oneBit
                    .getTileSource(data.icon)
                    .filtered(ImageFilters.tint(Color.RED_2))
                    .toComponent(
                        SpriteTransform.new({
                            position: new Point(TILE_SIZE / 2, 7),
                            depth,
                        }).relativeTo(this.t)
                    )
                this.entity.addComponent(icon)
            }
        }
    }

    update() {
        this.t.position = this.getPosition()
    }

    getRenderMethods() {
        const textPos = this.t.position
            .plusX(TILE_SIZE / 2 + (!!this.data.icon ? ICON_WIDTH : 0))
            .plusY(this.height / 2 - TEXT_SIZE / 2 + 0.5)
        return [
            new TextRender(
                this.data.text.toUpperCase(),
                textPos,
                TEXT_SIZE,
                TEXT_FONT,
                Color.RED_2,
                UIStateManager.UI_SPRITE_DEPTH + 20
            ),
        ]
    }

    isOffScreen() {
        return this.t.position.x > Camera.instance.dimensions.x
    }

    private getPosition() {
        const index = NotificationDisplay.instance.getNotifications().indexOf(this.data)
        const yOffset = 32 * index + OFFSET.y
        const offScreenPos = new Point(Camera.instance.dimensions.x + 10, yOffset)

        if (!this.t) {
            return offScreenPos
        }

        const onScreenPos = new Point(Camera.instance.dimensions.x - this.width + OFFSET.x, yOffset)
        const goalPosition = this.data.isExpired() ? offScreenPos : onScreenPos
        const diff = goalPosition.minus(this.t.position)
        const lerpRate = 0.22

        if (diff.magnitude() < 1) {
            return goalPosition
        } else {
            return this.t.position.plus(diff.times(lerpRate)).apply(Math.floor)
        }
    }
}

export class NotificationDisplay extends Component {
    static instance: NotificationDisplay

    private displayEntity: Entity
    private notifications: NotificationComponent[] = []

    constructor() {
        super()
        NotificationDisplay.instance = this
        this.displayEntity = new Entity([this])
    }

    push(notification: Notification) {
        controls.vibrate({
            duration: 50,
            strongMagnitude: 1,
            weakMagnitude: 0,
        })
        const component = new NotificationComponent(notification)
        this.notifications.push(component)
        // make sure awake() gets called after the notifications array is updated
        new Entity().addComponent(component)
    }

    update(updateData: UpdateData) {
        this.notifications = this.notifications.filter(
            (n) => !(n.isOffScreen() && n.data.isExpired())
        )
    }

    getNotifications() {
        return this.notifications.map((n) => n.data)
    }

    getById(id: string) {
        return this.notifications.find((n) => n.data.id === id)?.data
    }

    replace(notification: Notification & Required<Pick<Notification, "id">>) {
        const i = this.notifications.findIndex((n) => n.data.id === notification.id)
        const position = this.notifications[i].position
        this.notifications[i] = new NotificationComponent(notification, position)
        new Entity().addComponent(this.notifications[i])
    }

    getEntities(): Entity[] {
        return [this.displayEntity].concat(this.notifications.map((c) => c.entity))
    }
}
