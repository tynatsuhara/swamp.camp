import { assets, Component, Entity, Point, Scene, UpdateViewsContext } from "brigsby/dist"
import { BasicRenderComponent, ImageRender, renderer } from "brigsby/dist/renderer"
import { SpriteComponent, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { View } from "brigsby/dist/View"
import { Ambiance } from "../audio/Ambiance"
import { loadDeferredAudio } from "../audio/DeferLoadAudio"
import { Music } from "../audio/Music"
import { DudeAnimationUtils } from "../characters/DudeAnimationUtils"
import { resetPlayerInstances } from "../characters/player"
import { controls } from "../Controls"
import { DevControls } from "../debug/DevControls"
import { FireParticles } from "../graphics/particles/FireParticles"
import { Particles } from "../graphics/particles/Particles"
import { getFilesToLoadForGame, getImage, TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { session, SESSION_ID_LENGTH } from "../online/session"
import { guestOnJoin } from "../online/syncGame"
import { saveManager } from "../SaveManager"
import { Save } from "../saves/SaveGame"
import { Singletons } from "../Singletons"
import { SwampCampGame, ZOOM } from "../SwampCampGame"
import { Cursor } from "../ui/Cursor"
import { MainMenuButtonSection } from "../ui/MainMenuButtonSection"
import { PLUME_COLORS, PlumePicker } from "../ui/PlumePicker"
import { TEXT_SIZE } from "../ui/Text"
import { TextInput } from "../ui/TextInput"
import { UI_SPRITE_DEPTH } from "../ui/UiConstants"
import { UISounds } from "../ui/UISounds"
import { DarknessMask } from "../world/DarknessMask"

enum Menu {
    ROOT,
    LOAD_GAME,
    NEW_GAME,
    PICK_COLOR,
    CREDITS,
    DOWNLOADS,
    MULTIPLAYER,
    LOADING,
}

enum SessionLoadingState {
    CONNECTING = "connecting...",
    LOADING_WORLD = "loading world...",
    NOT_FOUND = "session not found!",
}

let cancelJoinTimeout: NodeJS.Timeout

const IS_NATIVE_APP = window.SWAMP_CAMP.native

export class MainMenuScene extends Scene {
    private plumes: PlumePicker
    private knightEntity = new Entity()
    private knight: SpriteComponent
    private title = getImage("images/title.png")
    private darkness: DarknessMask
    private view: View
    private allAssetsLoaded = false
    private waitingForAssets = false
    private sessionLoadingState: SessionLoadingState | undefined
    private sessionIdTextInput: TextInput

    private get showLoadingMessage() {
        return this.waitingForAssets || this.menu === Menu.LOADING
    }

    private menu = Menu.ROOT

    constructor() {
        super()
        this.loadAssets(false)
    }

    private async loadAssets(blocking = true) {
        UISounds.loadAll()
        if (this.allAssetsLoaded) {
            return Promise.resolve()
        }
        if (blocking) {
            console.log("waiting for assets to load before continuing")
            this.waitingForAssets = true
        }
        await assets.loadImageFiles(getFilesToLoadForGame())
        // it's probably okay if audio loads late
        loadDeferredAudio()
        this.allAssetsLoaded = true
        this.waitingForAssets = false
        console.log("assets loaded!")
    }

    reset() {
        Singletons.clear()

        this.sessionLoadingState = undefined

        resetPlayerInstances()

        // TODO: this isn't fully effective
        Music.stop()
        Ambiance.stop()

        this.plumes = new PlumePicker(
            this.getMenuTop(),
            saveManager.getState().plumeIndex,
            (color) => {
                // console.log(color)
                const newKnightAnimation = DudeAnimationUtils.getCharacterIdleAnimation(
                    "knight_f",
                    {
                        color,
                    }
                ).toComponent(this.knight?.transform)

                requestAnimationFrame(() => {
                    if (this.knight) {
                        this.knightEntity.removeComponent(this.knight)
                    }
                    this.knight = this.knightEntity.addComponent(newKnightAnimation)
                })

                // if (!this.knight?.entity) {
                // console.log(this.knight)
                // } else {
                //     console.log(this.knight)
                //     // console.log(this.knight.entity)
                //     const existingEntity = this.knight.entity
                //     // console.log(`replace`)
                //     existingEntity.removeComponent(this.knight)
                //     existingEntity.addComponent(newKnightAnimation)
                // }
            }
        )

        this.darkness = new Entity().addComponent(new DarknessMask(false))

        this.render(Menu.ROOT)
    }

    loadLastSave() {
        const slot = saveManager.getLastSaveSlot()
        this.loadGame(slot)
    }

    async loadGame(slot: number) {
        await this.loadGameContent()
        saveManager.load(slot)
    }

    private overwritingSave: Save
    private selectedNewGameSlot: number

    async newGame() {
        await this.loadGameContent()
        saveManager.new(this.selectedNewGameSlot, this.plumes)
        SwampCampGame.instance.loadGameScene()
        SwampCampGame.instance.gameScene.newGame()
    }

    private async loadGameContent() {
        this.render(Menu.LOADING)
        await this.loadAssets()
        // wait 2 frames to make sure the "loading..." message has started showing
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    }

    private lastDimensions: Point

    private render(menu: Menu) {
        this.menu = menu
        this.view = null // force re-render
    }

    private getDimensions() {
        return renderer.getDimensions().div(ZOOM)
    }

    private getMenuTop() {
        return this.getDimensions().floorDiv(2).plusY(31)
    }

    getViews(updateViewsContext: UpdateViewsContext) {
        const dimensions = this.getDimensions()

        // we need to re-render this each time since image bitmaps are async
        // this.darkness?.render(dimensions, Point.ZERO)

        const menuTop = this.getMenuTop()
        const knightPos = menuTop
            .minus(this.knight.transform.dimensions.floorDiv(2).plusY(24))
            .plusX(-17)
            .plusY(-37)
        this.knight.transform.position = knightPos

        // Don't re-render if nothing has changed, since a lot of
        // these functions involve parsing all of our save slots
        if (this.view && renderer.getDimensions().equals(this.lastDimensions)) {
            return [this.view]
        }

        const titleDimensions = new Point(200, 50)
        const title = new Entity([
            new BasicRenderComponent(
                new ImageRender(
                    this.title,
                    Point.ZERO,
                    titleDimensions,
                    menuTop.plusX(-titleDimensions.x / 2).plusY(-100 - titleDimensions.y / 2),
                    titleDimensions,
                    UI_SPRITE_DEPTH
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
            this.knightEntity,
            this.darkness.entity,
            ...sceneEntities,
            new Entity([new DevControls()]),
        ]

        const link = (url: string) => () => window.open(url, "_blank")

        if (this.menu === Menu.MULTIPLAYER) {
            if (this.sessionLoadingState) {
                const backFn = () => {
                    clearTimeout(cancelJoinTimeout)
                    this.sessionLoadingState = undefined
                    session.close()
                    this.render(Menu.MULTIPLAYER)
                }
                entities.push(
                    new MainMenuButtonSection(menuTop, backFn)
                        .addText(this.sessionLoadingState)
                        .add("cancel", backFn)
                        .getEntity()
                )
            } else {
                const cancelJoin = () => {
                    clearTimeout(cancelJoinTimeout)
                    this.sessionIdTextInput = this.sessionIdTextInput?.delete()
                    this.sessionLoadingState = undefined
                    session.close()
                    this.render(Menu.ROOT) // force re-render
                }

                const joinSession = () => {
                    const sessionId = this.sessionIdTextInput.getValue()
                    if (!sessionId.length) {
                        return
                    }

                    Promise.all([this.loadAssets(), session.join(sessionId)]).then(() => {
                        if (this.sessionLoadingState) {
                            clearTimeout(cancelJoinTimeout)
                            this.sessionLoadingState = SessionLoadingState.LOADING_WORLD
                            this.render(Menu.MULTIPLAYER) // force re-render
                            guestOnJoin()
                        }
                    })

                    this.sessionIdTextInput = this.sessionIdTextInput.delete()
                    this.sessionLoadingState = SessionLoadingState.CONNECTING

                    cancelJoinTimeout = setTimeout(() => {
                        cancelJoin()
                        this.sessionLoadingState = SessionLoadingState.NOT_FOUND
                        this.render(Menu.MULTIPLAYER) // force re-render
                    }, 15_000)

                    this.render(Menu.MULTIPLAYER) // force re-render
                }

                if (!this.sessionIdTextInput) {
                    this.sessionIdTextInput = new TextInput(
                        "SESSION @",
                        menuTop,
                        SESSION_ID_LENGTH,
                        joinSession
                    )
                } else {
                    this.sessionIdTextInput.reposition(menuTop)
                }

                entities.push(
                    new MainMenuButtonSection(menuTop, cancelJoin)
                        .addLineBreak()
                        .add("connect", joinSession, !this.sessionLoadingState)
                        .add("cancel", cancelJoin)
                        .getEntity()
                )
            }
        } else if (this.showLoadingMessage) {
            entities.push(new MainMenuButtonSection(menuTop).addText("loading...").getEntity())
        } else if (this.menu === Menu.ROOT) {
            const saveCount = saveManager.getSaveCount()
            entities.push(
                new MainMenuButtonSection(menuTop)
                    .add("continue", () => this.loadLastSave(), saveCount > 0)
                    .add("load save", () => this.render(Menu.LOAD_GAME), saveCount > 1)
                    .add("New game", () => this.render(Menu.NEW_GAME))
                    .add("multiplayer", () => this.render(Menu.MULTIPLAYER))
                    .add("Download", () => this.render(Menu.DOWNLOADS), !IS_NATIVE_APP)
                    .add("Credits", () => this.render(Menu.CREDITS))
                    .add(
                        "Quit",
                        () => {
                            // add a delay so we still hear the click
                            setTimeout(
                                () => document.dispatchEvent(new Event("swamp-camp-quit")),
                                200
                            )
                        },
                        IS_NATIVE_APP
                    )
                    .getEntity()
            )
        } else if (this.menu === Menu.DOWNLOADS) {
            const backFn = () => this.render(Menu.ROOT)
            entities.push(
                new MainMenuButtonSection(menuTop, backFn)
                    .add(
                        "Windows",
                        link(
                            "https://github.com/tylerbonnell/swamp-camp-native/releases/download/windows-latest/swamp-camp-win32-x64.zip"
                        )
                    )
                    .add(
                        "Linux",
                        link(
                            "https://github.com/tynatsuhara/swamp-camp-native/releases/download/ubuntu-latest/swamp-camp-linux-x64.zip"
                        )
                    )
                    .add(
                        "Mac (Intel)",
                        link(
                            "https://github.com/tylerbonnell/swamp-camp-native/releases/download/macos-latest/swamp-camp-darwin-x64.zip"
                        )
                    )
                    .add(
                        "Mac (Apple Silicon)",
                        link(
                            "https://github.com/tylerbonnell/swamp-camp-native/releases/tag/macos-apple-silicon"
                        )
                    )
                    .add("Back", backFn)
                    .getEntity()
            )
        } else if (this.menu === Menu.LOAD_GAME) {
            const backFn = () => {
                this.render(Menu.ROOT)
                this.resetPlume()
            }
            const menu = new MainMenuButtonSection(menuTop, backFn)
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
            menu.add("cancel", backFn)
            entities.push(menu.getEntity())
        } else if (this.menu === Menu.NEW_GAME) {
            const backFn = () => {
                this.render(Menu.ROOT)
                this.resetPlume()
            }
            const menu = new MainMenuButtonSection(menuTop, backFn)
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
            menu.add("cancel", backFn)
            entities.push(menu.getEntity())
        } else if (this.menu === Menu.PICK_COLOR) {
            const backFn = () => {
                this.render(Menu.NEW_GAME)
                this.resetPlume()
            }
            entities.push(
                this.plumes.entity,
                new MainMenuButtonSection(menuTop.plusY(42), backFn)
                    .add(`${this.overwritingSave ? "destroy save & " : ""}start`, () =>
                        this.newGame()
                    )
                    .add("cancel", backFn)
                    .getEntity()
            )
        } else if (this.menu === Menu.CREDITS) {
            const backFn = () => this.render(Menu.ROOT)
            entities.splice(0) // don't show title and scene
            const creditEntries: [credit: string, fn: () => void][] = [
                ["a game by Ty Natsuhara", link("https://ty.pizza/")],
                null,
                ["add'l art: Robert Norenberg", link("https://0x72.pl")],
                ["           Cael Johnson    ", link("https://caeljohnson.artstation.com")],
                ["           Kenney          ", link("https://kenney.nl")],
                ["    music: Juhani Junkala  ", link("https://juhanijunkala.com")],
                ["           Brent Bunn      ", link("https://bertn1991.newgrounds.com")],
                ["           Playonloop.com  ", link("https://playonloop.com")],
                ["    sound: BurghRecords    ", link("https://www.edinburghrecords.com")],
                ["           Antoine Goumain ", link("https://antoinegoumain.fr")],
                ["           Thor Arisland   ", link("https://tcarisland.no")],
                // ["           Morten SΘegaard ", link("twitter.com/littlerobotsfx")],  // TODO if we use the "voices" pack
                null,
                ["made with brigsby!", link("https://brigsby.js.org/")],
                null,
                ["back", backFn],
            ]
            const section = new MainMenuButtonSection(
                new Point(
                    dimensions.x / 2,
                    dimensions.y / 2 -
                        (creditEntries.length * MainMenuButtonSection.LINE_SPACING) / 2 +
                        TEXT_SIZE / 2
                ),
                backFn
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
        entities.unshift(controls.entity, new Entity([new Cursor(() => !this.showLoadingMessage)]))

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
