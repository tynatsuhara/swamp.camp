import { assets, Component, Entity, Point, UpdateViewsContext } from "brigsby/dist"
import { BasicRenderComponent, ImageRender, renderer } from "brigsby/dist/renderer"
import { SpriteComponent, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { View } from "brigsby/dist/View"
import { Ambiance } from "../audio/Ambiance"
import { loadDeferredAudio } from "../audio/DeferLoadAudio"
import { Music } from "../audio/Music"
import { DudeAnimationUtils } from "../characters/DudeAnimationUtils"
import { Player } from "../characters/Player"
import { controls } from "../Controls"
import { DevControls } from "../debug/DevControls"
import { FireParticles } from "../graphics/particles/FireParticles"
import { Particles } from "../graphics/particles/Particles"
import { getFilesToLoadForGame, getImage, Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { guestListenForInit } from "../online/gameSync"
import { session } from "../online/session"
import { saveManager } from "../SaveManager"
import { Save } from "../saves/SaveGame"
import { IS_NATIVE_APP, SwampCampGame, ZOOM } from "../SwampCampGame"
import { Cursor } from "../ui/Cursor"
import { MainMenuButtonSection } from "../ui/MainMenuButtonSection"
import { PlumePicker, PLUME_COLORS } from "../ui/PlumePicker"
import { TEXT_SIZE } from "../ui/Text"
import { UISounds } from "../ui/UISounds"
import { UIStateManager } from "../ui/UIStateManager"
import { DarknessMask } from "../world/DarknessMask"

enum Menu {
    ROOT,
    LOAD_GAME,
    NEW_GAME,
    PICK_COLOR,
    CREDITS,
    DOWNLOADS,
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
        this.loadAssets(false)
    }

    private loadAssets(blocking = true) {
        UISounds.loadAll()
        if (this.allAssetsLoaded) {
            return Promise.resolve()
        }
        if (blocking) {
            console.log("waiting for assets to load before continuing")
            this.waitingForAssets = true
        }
        return assets.loadImageFiles(getFilesToLoadForGame()).then(() => {
            // it's probably okay if audio loads late
            loadDeferredAudio()

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
        this.plumes = new PlumePicker(saveManager.getState().plumeIndex, (color) => {
            this.knight = new Entity().addComponent(
                DudeAnimationUtils.getCharacterIdleAnimation("knight_f", {
                    color,
                }).toComponent()
            )
            this.view = null // force re-render
        })

        this.darkness = new Entity().addComponent(new DarknessMask(false))
    }

    loadLastSave() {
        const slot = saveManager.getLastSaveSlot()
        this.loadGame(slot)
    }

    loadGame(slot: number) {
        this.loadAssets().then(() => {
            saveManager.load(slot)
        })
        this.render(Menu.ROOT) // force re-render
    }

    private overwritingSave: Save
    private selectedNewGameSlot: number

    newGame() {
        this.loadAssets().then(() => {
            saveManager.new(this.selectedNewGameSlot, this.plumes)
            SwampCampGame.instance.loadGameScene()
            SwampCampGame.instance.game.newGame()
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
        // this.darkness?.render(dimensions, Point.ZERO)

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

        // const darknessEntity = this.darkness.render(dimensions, Point.ZERO)
        // if (!darknessEntity) {
        //     // darkness bitmaps haven't processed yet, wait to draw
        //     return []
        // }

        // by default, render the title and the scene with the knight
        const entities = [
            title,
            this.knight.entity,
            this.darkness.entity,
            ...sceneEntities,
            new Entity([new DevControls()]),
        ]

        const link = (url: string) => () => window.open(`https://${url}`, "_blank")

        if (this.waitingForAssets) {
            entities.push(new MainMenuButtonSection(menuTop).addText("loading...").getEntity())
        } else if (this.menu === Menu.ROOT) {
            const saveCount = saveManager.getSaveCount()
            entities.push(
                new MainMenuButtonSection(menuTop)
                    .add("continue", () => this.loadLastSave(), saveCount > 0)
                    .add("load save", () => this.render(Menu.LOAD_GAME), saveCount > 1)
                    .add("New game", () => this.render(Menu.NEW_GAME))
                    .add("multiplayer", () => {
                        session.join().then(() => {
                            console.log(session.getPeers())
                            console.log("joined online session")
                        })
                        guestListenForInit()
                    })
                    .add("Download", () => this.render(Menu.DOWNLOADS), !IS_NATIVE_APP)
                    .add("Credits", () => this.render(Menu.CREDITS))
                    .getEntity()
            )
        } else if (this.menu === Menu.DOWNLOADS) {
            entities.push(
                new MainMenuButtonSection(menuTop)
                    .add(
                        "Windows",
                        link(
                            "github.com/tylerbonnell/swamp-camp-native/releases/download/windows-latest/swamp-camp-win32-x64.zip"
                        )
                    )
                    .add(
                        "Mac (Intel)",
                        link(
                            "github.com/tylerbonnell/swamp-camp-native/releases/download/macos-latest/swamp-camp-darwin-x64.zip"
                        )
                    )
                    .add(
                        "Mac (Apple Silicon)",
                        link(
                            "github.com/tylerbonnell/swamp-camp-native/releases/tag/macos-apple-silicon"
                        )
                    )
                    .add("Back", () => this.render(Menu.ROOT))
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
            const creditEntries: [credit: string, fn: () => void][] = [
                ["a game by Tyler Bonnell", link("ty.pizza/")],
                null,
                ["add'l art: Robert Norenberg", link("0x72.pl")],
                ["           Cael Johnson    ", link("caeljohnson.artstation.com")],
                ["           Kenney          ", link("kenney.nl")],
                ["    music: Juhani Junkala  ", link("juhanijunkala.com")],
                ["           Brent Bunn      ", link("bertn1991.newgrounds.com")],
                ["           Playonloop.com  ", link("playonloop.com")],
                ["    sound: BurghRecords    ", link("www.edinburghrecords.com")],
                ["           Antoine Goumain ", link("antoinegoumain.fr")],
                ["           Thor Arisland   ", link("tcarisland.no")],
                // ["           Morten SΘegaard ", link("twitter.com/littlerobotsfx")],  // TODO if we use the "voices" pack
                null,
                ["made with brigsby!", link("brigsby.js.org/")],
                null,
                ["back", () => this.render(Menu.ROOT)],
            ]
            const section = new MainMenuButtonSection(
                new Point(
                    dimensions.x / 2,
                    dimensions.y / 2 -
                        (creditEntries.length * MainMenuButtonSection.LINE_SPACING) / 2 +
                        TEXT_SIZE / 2
                )
            )
            creditEntries.forEach((credit) => {
                if (credit) {
                    section.add(...credit)
                } else {
                    section.addLineBreak()
                }
            })
            entities.push(section.getEntity())
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

        // TODO: Add pets to main menu
        // const gb = DudeAnimationUtils.getCharacterIdleAnimation("gumball").toComponent(
        //     SpriteTransform.new({
        //         mirrorX: false,
        //         position: campfirePos.plus(new Point(-22, 3)),
        //     })
        // )
        // gb.fastForward(Math.random() * 1000)
        // components.push(gb)

        // darkness
        // this.darkness = new DarknessMask(false)
        this.darkness.reset(0, 1)
        this.darkness.addLightCircle(campfirePos.plusX(TILE_SIZE / 2).plusY(TILE_SIZE / 2), 72)

        return [new Entity(components), Particles.instance.getEntity()]
    }

    private previewingSlotPlume: number
    private slotColors: number[]
    private unusedColors: number[]

    private showPlumeForSave(slot: number) {
        if (!this.slotColors) {
            const saves = saveManager.getSaves()
            const saveColors = saves
                .filter((save) => !!save)
                .map((save) => save.state.plumeIndex ?? 0)
            // Defaulting to color index 16 because that is the default plume color
            // (despite it not being the first color in the selector)
            this.slotColors = saves.map((save) => save?.state?.plumeIndex ?? 16)
            this.unusedColors = Lists.range(0, PLUME_COLORS.length).filter(
                (colorIndex) => !saveColors.includes(colorIndex)
            )
        }
        if (slot === this.previewingSlotPlume) {
            return
        }
        this.previewingSlotPlume = slot
        this.plumes.select(this.slotColors[slot] ?? Lists.oneOf(this.unusedColors))
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
