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
import { Lists } from "../../engine/util/Lists"
import { DudeAnimationUtils } from "../characters/DudeAnimationUtils"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { QuestGame } from "../quest_game"
import { saveManager } from "../SaveManager"
import { Save } from "../saves/SaveGame"
import { Color } from "../ui/Color"
import { MainMenuButtonSection } from "../ui/MainMenuButtonSection"
import { CUSTOMIZATION_OPTIONS, PlumePicker } from "../ui/PlumePicker"
import { UIStateManager } from "../ui/UIStateManager"
import { DarknessMask } from "../world/DarknessMask"

const ZOOM = 3

enum Menu {
    ROOT,
    LOAD_GAME,
    NEW_GAME,
    PICK_COLOR,
    CREDITS,
}

export class MainMenuScene {

    private plumes: PlumePicker
    private knight: TileComponent
    private title = assets.getImageByFileName("images/title.png")

    private menu = Menu.ROOT

    constructor() {
        if (saveManager.getSaveCount() > 0 && debug.autoPlay) {
            this.loadLastSave()
        }
    }

    reset() {
        this.menu = Menu.ROOT
        this.plumes = new PlumePicker(
            saveManager.getState().plume,
            color => this.knight = new Entity().addComponent(
                DudeAnimationUtils.getCharacterIdleAnimation("knight_f", { color }).toComponent()
            )
        )
    }

    loadLastSave() {
        const slot = saveManager.getLastSaveSlot()
        this.loadGame(slot)
    }

    loadGame(slot: number) {
        saveManager.load(slot)
        QuestGame.instance.loadGameScene()
    }

    private overwritingSave: Save
    private selectedNewGameSlot: number

    newGame() {
        saveManager.new(this.selectedNewGameSlot, this.plumes)
        QuestGame.instance.loadGameScene()
        QuestGame.instance.game.newGame()
    }

    private lastDimensions: Point
    private sceneEntities: Entity[]
    
    getViews(updateViewsContext: UpdateViewsContext) {
        const dimensions = updateViewsContext.dimensions.div(ZOOM)
        const saveCount = saveManager.getSaveCount()
        const center = dimensions.floorDiv(2)

        const menuTop = center.plusY(31)
        this.plumes.position = menuTop
        const knightPos = menuTop
                .minus(this.knight.transform.dimensions.floorDiv(2).plusY(24))
                .plusX(-15)
                .plusY(-37)
        this.knight.transform.position = knightPos

        const titleDimensions = new Point(200, 50)
        const title = new Entity([new BasicRenderComponent(new ImageRender(
            this.title,
            Point.ZERO,
            titleDimensions,
            menuTop.plusX(-titleDimensions.x/2).plusY(-100 - titleDimensions.y/2),
            titleDimensions,
            UIStateManager.UI_SPRITE_DEPTH
        ))])

        // resize window
        if (!updateViewsContext.dimensions.equals(this.lastDimensions)) {
            this.sceneEntities = this.getSceneEntities(knightPos, dimensions)
            this.lastDimensions = updateViewsContext.dimensions
        }

        // by default, render the title and the scene with the knight
        const entities = [
            title,
            this.knight.entity, 
            ...this.sceneEntities
        ]

        if (this.menu === Menu.ROOT) {
            entities.push(
                new MainMenuButtonSection(menuTop)
                    .add("continue", () => this.loadLastSave(), saveCount > 0)
                    .add("load save", () => this.menu = Menu.LOAD_GAME, saveCount > 1)
                    .add("New game", () => this.menu = Menu.NEW_GAME)
                    .add("Credits", () => this.menu = Menu.CREDITS)
                    .getEntity()
            )
        } else if(this.menu === Menu.LOAD_GAME) {
            const menu = new MainMenuButtonSection(menuTop)
            saveManager.getSaves().forEach((save, i) => {
                if (save) {
                    menu.add(
                        `slot ${i+1} (${this.getSaveMetadataString(save)})`, 
                        () => this.loadGame(i),
                        true,
                        () => this.showPlumeForSave(i)
                    )
                }
            })
            menu.add("cancel", () => {
                this.menu = Menu.ROOT
                this.resetPlume()
            })
            entities.push(menu.getEntity())
        } else if (this.menu === Menu.NEW_GAME) {
            const menu = new MainMenuButtonSection(menuTop)
            saveManager.getSaves().forEach((save, i) => {
                menu.add(
                    `slot ${i+1}: ${!save ? "new game" : `overwrite (${this.getSaveMetadataString(save)})`}`, 
                    () => {
                        this.overwritingSave = save
                        this.selectedNewGameSlot = i
                        this.menu = Menu.PICK_COLOR
                    },
                    true,
                    () => this.showPlumeForSave(i)
                )
            })
            menu.add("cancel", () => { 
                this.menu = Menu.ROOT
                this.resetPlume()
            })
            entities.push(menu.getEntity())
        } else if (this.menu === Menu.PICK_COLOR) {
            entities.push(
                this.plumes.entity,
                new MainMenuButtonSection(menuTop.plusY(42))
                        .add(`${this.overwritingSave ? "destroy save & " : ""}start`, () => this.newGame())
                        .add("cancel", () => {
                            this.menu = Menu.NEW_GAME
                            this.resetPlume()
                        })
                        .getEntity()
            )
        } else if (this.menu === Menu.CREDITS) {
            entities.splice(0)  // don't show title and scene
            const link = (url: string) => () => window.open(url, '_blank')
            const entryCount = 11  // UPDATE THIS IF YOU ADD MORE CREDITS
            const top = new Point(dimensions.x/2, dimensions.y/2 - entryCount * MainMenuButtonSection.LINE_SPACING/2)
            entities.push(
                new MainMenuButtonSection(top)
                    .add(" code: Tyler Bonnell   ", link("https://ty.pizza/"))
                    .add("  art: Robert Norenberg", link("http://0x72.pl/"))
                    .add("       Cael Johnson    ", link("https://caeljohnson.artstation.com/"))
                    .add("       Kenney          ", link("https://kenney.nl/"))
                    .add("music: Juhani Junkala  ", link("https://juhanijunkala.com/"))
                    .add("       Brent Bunn      ", link("https://bertn1991.newgrounds.com/"))
                    .add("       Playonloop.com  ", link("https://playonloop.com/"))
                    .add("sound: BurghRecords    ", link("https://www.edinburghrecords.com/"))
                    .add("   qa: Lane Van Elderen", link("https://lane.computer/"))
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

    private previewingSlotPlume: number
    private slotColors: Color[][]
    private unusedColors: Color[][]

    private showPlumeForSave(slot: number) {
        if (!this.slotColors) {
            const saves = saveManager.getSaves()
            const saveColors = saves.filter(save => !!save).map(save => save.state.plume[0])
            this.slotColors = saves.map(save => save?.state?.plume)
            this.unusedColors = CUSTOMIZATION_OPTIONS.filter(colorArray => !saveColors.includes(colorArray[0]))
        }
        if (slot === this.previewingSlotPlume) {
            return
        }
        this.previewingSlotPlume = slot
        this.plumes.select(this.slotColors[slot] || Lists.oneOf(this.unusedColors))
    }

    private resetPlume() {
        this.previewingSlotPlume = -1
        this.plumes.reset()
    }

    private getSaveMetadataString(save: Save) {
        const saveDate = new Date()
        saveDate.setTime(save.timeSaved)

        let timePlayed: string
        const minutesPlayed = Math.floor((save.state.timePlayed || 0)/(60_000))
        if (minutesPlayed > 60) {
            timePlayed = `${Math.floor(minutesPlayed/60)} hour${minutesPlayed > 120 ? 's' : ''}`
        } else {
            timePlayed = `${minutesPlayed} minute${minutesPlayed !== 1 ? 's' : ''}`
        }

        return `${timePlayed} played`
    }
}