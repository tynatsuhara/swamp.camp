import { assets } from "../../engine/Assets"
import { Component } from "../../engine/Component"
import { debug } from "../../engine/Debug"
import { UpdateViewsContext } from "../../engine/Engine"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { DudeAnimationUtils } from "../characters/DudeAnimationUtils"
import { DevControls } from "../DevControls"
import { pixelPtToTilePt, Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { saveManager } from "../SaveManager"
import { MainMenuButton } from "../ui/MainMenuButton"
import { MainMenuButtonSection } from "../ui/MainMenuButtonSection"
import { PlumePicker } from "../ui/PlumePicker"
import { UIStateManager } from "../ui/UIStateManager"
import { DarknessMask } from "../world/DarknessMask"

const ZOOM = 3

enum Menu {
    ROOT,
    NEW_GAME,
    CREDITS,
}

export class MainMenuScene {

    private readonly continueFn: () => void
    private readonly newGameFn: () => void

    private readonly plumes: PlumePicker = new PlumePicker(color => {
        this.knight = new Entity().addComponent(
            DudeAnimationUtils.getCharacterIdleAnimation("knight_f", { color }).toComponent()
        )
    })
    private knight: TileComponent
    private title = assets.getImageByFileName("images/title.png")

    private menu = Menu.ROOT

    constructor(continueFn: () => void, newGameFn: () => void) {
        this.continueFn = continueFn
        this.newGameFn = newGameFn

        // Verify that the existing save is compatible
        if (saveManager.saveFileExists() && !saveManager.isSaveFormatVersionCompatible()) {
            // TODO: add a mechanism for upgrading saves when it's worth the effort
            console.log("archiving incompatible save file")
            saveManager.archiveSave()
        }

        if (saveManager.saveFileExists() && debug.autoPlay) {
            this.continueFn()
        }
    }

    private lastDimensions: Point
    private sceneEntities: Entity[]
    
    getViews(updateViewsContext: UpdateViewsContext) {
        DevControls.checkDevControls(updateViewsContext.input)

        const dimensions = updateViewsContext.dimensions.div(ZOOM)
        const saveFileExists = saveManager.saveFileExists()
        const center = dimensions.floorDiv(2)

        const menuTop = center.plusY(31)
        this.plumes.position = menuTop
        const knightPos = center
                .minus(this.knight.transform.dimensions.floorDiv(2).plusY(24))
                .plusX(-15)
                .plusY(-6)
        this.knight.transform.position = knightPos

        // resize window
        if (!updateViewsContext.dimensions.equals(this.lastDimensions)) {
            this.sceneEntities = this.getSceneEntities(knightPos, dimensions)
            this.lastDimensions = updateViewsContext.dimensions
        }

        // by default, render the title and the scene with the knight
        const titleDimensions = new Point(200, 50)
        const entities = [
            this.knight.entity, 
            new Entity([new BasicRenderComponent(new ImageRender(
                this.title,
                Point.ZERO,
                titleDimensions,
                menuTop.plusX(-titleDimensions.x/2).plusY(-100 - titleDimensions.y/2),
                titleDimensions,
                UIStateManager.UI_SPRITE_DEPTH
            ))]),
            ...this.sceneEntities
        ]

        if (this.menu === Menu.ROOT) {
            entities.push(
                new MainMenuButtonSection(menuTop)
                    .add("load last save", this.continueFn, saveFileExists)
                    .add("New game", () => { this.menu = Menu.NEW_GAME })
                    .add("Credits", () => { this.menu = Menu.CREDITS })
                    .getEntity()
            )
        } else if (this.menu === Menu.NEW_GAME) {
            entities.push(this.plumes.entity)
            entities.push(
                new MainMenuButtonSection(menuTop.plusY(42))
                    .add(`start${saveFileExists ? " (delete old save)" : ""}`, this.newGameFn)
                    .add("cancel", () => { 
                        this.menu = Menu.ROOT
                        this.plumes.reset()
                    })
                    .getEntity()
            )
        } else if (this.menu === Menu.CREDITS) {
            entities.splice(0)  // don't show title and scene
            const link = (url: string) => () => window.open(url, '_blank')
            const top = new Point(dimensions.x/2, 50)
            entities.push(
                new MainMenuButtonSection(top)
                    .add("developer: Tyler Bonnell   ", link("https://ty.pizza/"))
                    .addLineBreak()
                    .add("      art: Robert Norenberg", link("http://0x72.pl/"))
                    .add("           Cael Johnson    ", link("https://caeljohnson.artstation.com/"))
                    .add("           Kenney          ", link("https://kenney.nl/"))
                    .addLineBreak()
                    .add("    music: Juhani Junkala  ", link("https://juhanijunkala.com/"))
                    .add("           Brent Bunn      ", link("https://bertn1991.newgrounds.com/"))
                    .add("           Playonloop.com  ", link("https://playonloop.com/"))
                    .addLineBreak()
                    .add("    sound: BurghRecords    ", link("https://www.edinburghrecords.com/"))
                    .addLineBreak()
                    .add("back", () => this.menu = Menu.ROOT)
                    .getEntity()
            )
        }

        return [{ 
            zoom: ZOOM,
            offset: Point.ZERO,
            entities
        }];
    }

    // scene constants
    private static readonly SIZE = 10
    private static readonly GRASS = Array.from(
        { length: MainMenuScene.SIZE * 2 * MainMenuScene.SIZE * 2 }, 
        () => Math.random() < .65 ? Math.floor(Math.random() * 4) : 0
    )

    private getSceneEntities(offset: Point, dimensions: Point) {
        const components: Component[] = []

        // grass
        for (let x = -MainMenuScene.SIZE; x < MainMenuScene.SIZE; x++) {
            for (let y = -MainMenuScene.SIZE; y < MainMenuScene.SIZE; y++) {
                // copied from grass component
                let tile: StaticTileSource
                const index = (y + MainMenuScene.SIZE) + (MainMenuScene.SIZE * 2 * (x + MainMenuScene.SIZE))
                const grassType = MainMenuScene.GRASS[index]
                if (grassType > 0) {
                    tile = Tilesets.instance.tilemap.getTileAt(new Point(0, grassType))
                } else {
                    tile = Tilesets.instance.tilemap.getTileAt(new Point(0, 7))
                }
                const render = tile.toImageRender(
                    TileTransform.new({ 
                        position: new Point(x, y).times(TILE_SIZE).plus(offset),
                        depth: Number.MIN_SAFE_INTEGER,
                    })
                )
                components.push(new BasicRenderComponent(render))
            }
        }

        // campfire
        const campfirePos = new Point(.5, 0).times(TILE_SIZE)
                .plus(offset)
                .plusX(6)
                .plusY(20)
                .apply(Math.floor)
        components.push(new AnimatedTileComponent(
            [Tilesets.instance.outdoorTiles.getTileSetAnimation("campfireOn", 2, 200)],
            new TileTransform(campfirePos)
        ))

        // darkness
        const darkness = new DarknessMask()
        darkness.addLightCircle(campfirePos.plusX(TILE_SIZE/2).plusY(TILE_SIZE/2), 72)

        return [
            new Entity(components), 
            darkness.getEntity(dimensions, Point.ZERO)
        ]
    }
}