import { Entity } from "../engine/Entity"
import { Point } from "../engine/point"
import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/View"
import { MapGenerator } from "./world/MapGenerator"
import { Tilesets, TILE_SIZE } from "./graphics/Tilesets"
import { DudeFactory, DudeType } from "./characters/DudeFactory"
import { HUD } from "./ui/HUD"
import { LocationManager } from "./world/LocationManager"
import { Dude } from "./characters/Dude"
import { CollisionEngine } from "../engine/collision/CollisionEngine"
import { DroppedItem } from "./items/DroppedItem"
import { UIStateManager } from "./ui/UIStateManager"
import { serialize } from "./saves/SerializeObject"
import { Save, StoryState } from "./saves/SaveGame"
import { Elements } from "./world/elements/Elements"
import { Ground } from "./world/ground/Ground"
import { InputKey } from "../engine/input"
import { Player } from "./characters/Player"


const ZOOM = 3

export class QuestGame extends Game {

    private locationManager: LocationManager
    private player: Dude

    readonly tilesets = new Tilesets()
    readonly dudeFactory = new DudeFactory()
    readonly uiStateManager = new UIStateManager()
    
    private gameEntityView: View = new View()
    private uiView: View = new View()

    initialize() {
        CollisionEngine.instance.setCollisionMatrix(new Map([
            [CollisionEngine.DEFAULT_LAYER, [DroppedItem.COLLISION_LAYER, Dude.COLLISION_LAYER]],
            [Dude.COLLISION_LAYER, [Dude.COLLISION_LAYER]],
        ]))

        // Initialize singletons
        new Elements()
        new Ground()


        const newGame = true//!this.load()

        if (newGame) {
            this.locationManager = new LocationManager()
            // World must be initialized before we do anything else
            new MapGenerator().doIt()
            this.player = this.dudeFactory.new(DudeType.PLAYER, new Point(-2, 2).times(TILE_SIZE))

            // TEST: Spawn some guys
            // this.dudeFactory.new(DudeType.ELF, new Point(20, 30))
            // for (let i = 0; i < 5; i++) {
            //     this.dudeFactory.new(DudeType.ORC_WARRIOR, new Point(40, 30 + 20 * i))
            // }
        }
    }

    // entities in the world space
    getViews(updateViewsContext: UpdateViewsContext): View[] {
        // TEMPORARY TEST INPUTS
        if (updateViewsContext.input.isKeyDown(InputKey.J)) {
            this.save()
        } else if (updateViewsContext.input.isKeyDown(InputKey.K)) {
            this.load()
        }
        if (updateViewsContext.input.isKeyDown(InputKey.L)) {
            this.dudeFactory.new(DudeType.ORC_WARRIOR, new Point(40, 30))
        }




        this.updateViews(updateViewsContext)
        return [
            this.gameEntityView, 
            this.uiView
        ]
    }

    updateViews(updateViewsContext: UpdateViewsContext) {
        const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
        const dimensions = updateViewsContext.dimensions.div(ZOOM)
        const xLimit = MapGenerator.MAP_SIZE / 2 * TILE_SIZE - dimensions.x/2
        const yLimit = MapGenerator.MAP_SIZE / 2 * TILE_SIZE - dimensions.y/2
        const clampedPlayerPos = new Point(
            clamp(this.player.position.x, -xLimit, xLimit),
            clamp(this.player.position.y, -yLimit, yLimit)
        )
        const cameraGoal = dimensions.div(2).minus(clampedPlayerPos)

        this.gameEntityView = { 
            zoom: ZOOM,
            offset: this.gameEntityView.offset.lerp(.0018 * updateViewsContext.elapsedTimeMillis, cameraGoal),
            entities: this.locationManager.currentLocation.getEntities()
        }

        this.uiView = {
            zoom: ZOOM,
            offset: new Point(0, 0),
            entities: this.uiStateManager.get(updateViewsContext)
        }
    }

    save() {
        const save: Save = {
            // storyState: StoryState.INTRODUCTION,
            locations: this.locationManager.save(),
            time: new Date().getMilliseconds()
        } 
        console.log("saved game")
        localStorage.setItem("save", JSON.stringify(save))
    }

    /**
     * @return true if a save was loaded successfully
     */
    load(): boolean {
        const blob = localStorage.getItem("save")
        if (!blob) {
            console.log("no save found")
            return false
        }
        
        const save: Save = JSON.parse(blob)
        const prettyPrintTimestamp = new Date()
        prettyPrintTimestamp.setMilliseconds(save.time)
        console.log(`loaded save from ${prettyPrintTimestamp}`)

        this.locationManager = LocationManager.load(save.locations)
        this.player = Array.from(this.locationManager.currentLocation.dudes)
                .map(d => d.entity.getComponent(Player))
                .filter(c => !!c)
                .shift()
                .dude
        
        return true
    }
}
