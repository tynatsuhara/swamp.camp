import { assets } from "brigsby/dist/Assets"
import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { UpdateViewsContext } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { BasicRenderComponent } from "brigsby/dist/renderer/BasicRenderComponent"
import { ImageRender } from "brigsby/dist/renderer/ImageRender"
import { renderer } from "brigsby/dist/renderer/Renderer"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Lists } from "brigsby/dist/util/Lists"
import { View } from "brigsby/dist/View"
import { Ambiance } from "../audio/Ambiance"
import { Music } from "../audio/Music"
import { DudeAnimationUtils } from "../characters/DudeAnimationUtils"
import { Player } from "../characters/Player"
import { controls } from "../Controls"
import { FireParticles } from "../graphics/FireParticles"
import { Particles } from "../graphics/Particles"
import { getFilesToLoadForGame, getImage, Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { QuestGame } from "../quest_game"
import { saveManager } from "../SaveManager"
import { Save } from "../saves/SaveGame"
import { Color } from "../ui/Color"
import { Cursor } from "../ui/Cursor"
import { MainMenuButtonSection } from "../ui/MainMenuButtonSection"
import { CUSTOMIZATION_OPTIONS, PlumePicker } from "../ui/PlumePicker"
import { TEXT_SIZE } from "../ui/Text"
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
    private knight: SpriteComponent
    private title = getImage("images/title.png")
    private darkness: DarknessMask
    private view: View
    private allAssetsLoaded = false
    private waitingForAssets = false

    private menu = Menu.ROOT

    constructor() {
        if (saveManager.getSaveCount() > 0 && debug.autoPlay) {
            this.loadLastSave()
        }
        this.loadAssets(false)
    }

    private loadAssets(blocking = true) {
        if (this.allAssetsLoaded) {
            return Promise.resolve()
        }
        if (blocking) {
            console.log("waiting for assets to load before continuing")
            this.waitingForAssets = true
        }
        return assets.loadImageFiles(getFilesToLoadForGame()).then(() => {
            this.allAssetsLoaded = true
            this.waitingForAssets = false
            console.log("assets loaded!")
        })
    }

    reset() {
        Player.instance = undefined

        // TODO: this isn't fully effective
        Music.stop()
        Ambiance.stop()

        this.render(Menu.ROOT)
        this.plumes = new PlumePicker(saveManager.getState().plume, (color) => {
            this.knight = new Entity().addComponent(
                DudeAnimationUtils.getCharacterIdleAnimation("knight_f", {
                    color,
                }).toComponent()
            )
            this.view = null // force re-render
        })
    }

    loadLastSave() {
        const slot = saveManager.getLastSaveSlot()
        this.loadGame(slot)
    }

    loadGame(slot: number) {
        this.loadAssets().then(() => {
            saveManager.load(slot)
            QuestGame.instance.loadGameScene()
        })
        this.render(Menu.ROOT) // force re-render
    }

    private overwritingSave: Save
    private selectedNewGameSlot: number

    newGame() {
        this.loadAssets().then(() => {
            saveManager.new(this.selectedNewGameSlot, this.plumes)
            QuestGame.instance.loadGameScene()
            QuestGame.instance.game.newGame()
        })
        this.render(Menu.ROOT) // force re-render
    }

    private lastDimensions: Point

    private render(menu: Menu) {
        this.menu = menu
        this.view = null // force re-render
    }

    getViews(updateViewsContext: UpdateViewsContext) {
        const dimensions = renderer.getDimensions().div(ZOOM)

        // we need to re-render this each time since image bitmaps are async
        this.darkness?.render(dimensions, Point.ZERO)

        // Don't re-render if nothing has changed, since a lot of
        // these functions involve parsing all of our save slots
        if (this.view && renderer.getDimensions().equals(this.lastDimensions)) {
            return [this.view]
        }

        const center = dimensions.floorDiv(2)
        const menuTop = center.plusY(31)
        this.plumes.position = menuTop
        const knightPos = menuTop
            .minus(this.knight.transform.dimensions.floorDiv(2).plusY(24))
            .plusX(-17)
            .plusY(-37)
        this.knight.transform.position = knightPos

        const titleDimensions = new Point(200, 50)
        const title = new Entity([
            new BasicRenderComponent(
                new ImageRender(
                    this.title,
                    Point.ZERO,
                    titleDimensions,
                    menuTop.plusX(-titleDimensions.x / 2).plusY(-100 - titleDimensions.y / 2),
                    titleDimensions,
                    UIStateManager.UI_SPRITE_DEPTH
                )
            ),
        ])

        // This will set up the darkness mask
        const sceneEntities = this.getSceneEntities(knightPos)
        this.lastDimensions = renderer.getDimensions()

        const darknessEntity = this.darkness.render(dimensions, Point.ZERO)
        if (!darknessEntity) {
            // darkness bitmaps haven't processed yet, wait to draw
            return []
        }

        // by default, render the title and the scene with the knight
        const entities = [title, this.knight.entity, darknessEntity, ...sceneEntities]

        if (this.waitingForAssets) {
            entities.push(
                new MainMenuButtonSection(menuTop).add("loading...", () => {}).getEntity()
            )
        } else if (this.menu === Menu.ROOT) {
            const saveCount = saveManager.getSaveCount()
            entities.push(
                new MainMenuButtonSection(menuTop)
                    .add("continue", () => this.loadLastSave(), saveCount > 0)
                    .add("load save", () => this.render(Menu.LOAD_GAME), saveCount > 1)
                    .add("New game", () => this.render(Menu.NEW_GAME))
                    .add("Credits", () => this.render(Menu.CREDITS))
                    .getEntity()
            )
        } else if (this.menu === Menu.LOAD_GAME) {
            const menu = new MainMenuButtonSection(menuTop)
            saveManager.getSaves().forEach((save, i) => {
                if (save) {
                    menu.add(
                        `slot ${i + 1} (${this.getSaveMetadataString(save)})`,
                        () => this.loadGame(i),
                        true,
                        () => this.showPlumeForSave(i)
                    )
                }
            })
            menu.add("cancel", () => {
                this.render(Menu.ROOT)
                this.resetPlume()
            })
            entities.push(menu.getEntity())
        } else if (this.menu === Menu.NEW_GAME) {
            const menu = new MainMenuButtonSection(menuTop)
            saveManager.getSaves().forEach((save, i) => {
                menu.add(
                    `slot ${i + 1}: ${
                        !save ? "new game" : `overwrite (${this.getSaveMetadataString(save)})`
                    }`,
                    () => {
                        this.overwritingSave = save
                        this.selectedNewGameSlot = i
                        this.render(Menu.PICK_COLOR)
                    },
                    true,
                    () => this.showPlumeForSave(i)
                )
            })
            menu.add("cancel", () => {
                this.render(Menu.ROOT)
                this.resetPlume()
            })
            entities.push(menu.getEntity())
        } else if (this.menu === Menu.PICK_COLOR) {
            entities.push(
                this.plumes.entity,
                new MainMenuButtonSection(menuTop.plusY(42))
                    .add(`${this.overwritingSave ? "destroy save & " : ""}start`, () =>
                        this.newGame()
                    )
                    .add("cancel", () => {
                        this.render(Menu.NEW_GAME)
                        this.resetPlume()
                    })
                    .getEntity()
            )
        } else if (this.menu === Menu.CREDITS) {
            entities.splice(0) // don't show title and scene
            const link = (url: string) => () => window.open(url, "_blank")
            const entryCount = 13 // UPDATE THIS IF YOU ADD MORE CREDITS
            const top = new Point(
                dimensions.x / 2,
                dimensions.y / 2 -
                    (entryCount * MainMenuButtonSection.LINE_SPACING) / 2 +
                    TEXT_SIZE / 2
            )
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
                    .add("made with brigsby!", link("https://brigsby.js.org/"))
                    .addLineBreak()
                    .add("back", () => this.render(Menu.ROOT))
                    .getEntity()
            )
        }

        // Always update the controls entity first
        entities.unshift(controls.entity, new Entity([new Cursor()]))

        this.view = {
            zoom: ZOOM,
            offset: Point.ZERO,
            entities,
        }

        return [this.view]
    }

    // scene constants
    private static readonly SIZE = 7
    private static readonly GRASS = Array.from(
        { length: MainMenuScene.SIZE * 2 * MainMenuScene.SIZE * 2 },
        () => (Math.random() < 0.65 ? Math.floor(Math.random() * 4) : 0)
    )

    private getSceneEntities(offset: Point) {
        const components: Component[] = []

        // grass
        for (let x = -MainMenuScene.SIZE; x < MainMenuScene.SIZE; x++) {
            for (let y = -MainMenuScene.SIZE; y < MainMenuScene.SIZE; y++) {
                // copied from grass component
                let tile: StaticSpriteSource
                const index =
                    y + MainMenuScene.SIZE + MainMenuScene.SIZE * 2 * (x + MainMenuScene.SIZE)
                const grassType = MainMenuScene.GRASS[index]
                if (grassType > 0) {
                    tile = Tilesets.instance.tilemap.getTileAt(new Point(0, grassType))
                } else {
                    tile = Tilesets.instance.tilemap.getTileAt(new Point(0, 7))
                }
                const render = tile.toImageRender(
                    SpriteTransform.new({
                        position: new Point(x, y).times(TILE_SIZE).plus(offset),
                        depth: Number.MIN_SAFE_INTEGER,
                    })
                )
                components.push(new BasicRenderComponent(render))
            }
        }

        // campfire stuff (unfortunately copied from Campfire.ts)
        const campfirePos = new Point(0.5, 0)
            .times(TILE_SIZE)
            .plus(offset)
            .plusX(8)
            .plusY(20)
            .apply(Math.floor)
        components.push(
            new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource("campfireRing"),
                SpriteTransform.new({ position: campfirePos })
            )
        )
        components.push(
            new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource("campfireLogs"),
                SpriteTransform.new({ position: campfirePos })
            )
        )
        components.push(
            new FireParticles(4, () => campfirePos.plus(new Point(TILE_SIZE / 2 - 1, 7)))
        )

        // darkness
        this.darkness = new DarknessMask(false)
        this.darkness.addLightCircle(campfirePos.plusX(TILE_SIZE / 2).plusY(TILE_SIZE / 2), 72)

        return [new Entity(components), Particles.instance.getEntity()]
    }

    private previewingSlotPlume: number
    private slotColors: Color[][]
    private unusedColors: Color[][]

    private showPlumeForSave(slot: number) {
        if (!this.slotColors) {
            const saves = saveManager.getSaves()
            const saveColors = saves.filter((save) => !!save).map((save) => save.state.plume[0])
            this.slotColors = saves.map((save) => save?.state?.plume)
            this.unusedColors = CUSTOMIZATION_OPTIONS.filter(
                (colorArray) => !saveColors.includes(colorArray[0])
            )
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
        const minutesPlayed = Math.floor((save.state.timePlayed || 0) / 60_000)
        if (minutesPlayed > 60) {
            timePlayed = `${Math.floor(minutesPlayed / 60)} hour${minutesPlayed > 120 ? "s" : ""}`
        } else {
            timePlayed = `${minutesPlayed} minute${minutesPlayed !== 1 ? "s" : ""}`
        }

        return `${timePlayed} played`
    }
}
