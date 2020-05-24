import { Point } from "../engine/point"
import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/View"
import { MapGenerator } from "./world/MapGenerator"
import { Tilesets, TILE_SIZE } from "./graphics/Tilesets"
import { DudeFactory, DudeType } from "./characters/DudeFactory"
import { LocationManager } from "./world/LocationManager"
import { Dude } from "./characters/Dude"
import { CollisionEngine } from "../engine/collision/CollisionEngine"
import { DroppedItem } from "./items/DroppedItem"
import { UIStateManager } from "./ui/UIStateManager"
import { Elements } from "./world/elements/Elements"
import { Ground } from "./world/ground/Ground"
import { InputKey } from "../engine/input"
import { CutsceneManager } from "./cutscenes/CutsceneManager"
import { IntroCutscene } from "./cutscenes/IntroCutscene"
import { Camera } from "./cutscenes/Camera"
import { SaveManager } from "./SaveManager"
import { Player } from "./characters/Player"


const ZOOM = 3

export class QuestGame extends Game {

    private gameEntityView: View
    private uiView: View

    initialize() {
        CollisionEngine.instance.setCollisionMatrix(new Map([
            [CollisionEngine.DEFAULT_LAYER, [DroppedItem.COLLISION_LAYER, Dude.COLLISION_LAYER]],
            [Dude.COLLISION_LAYER, [Dude.COLLISION_LAYER]],
        ]))

        // Initialize singletons
        new Tilesets()
        new UIStateManager()
        new SaveManager()
        new DudeFactory()
        new Elements()
        new Ground()
        new Camera()
        new CutsceneManager()
        new LocationManager()

        const newGame = !SaveManager.instance.load()

        if (newGame) {
            // World must be initialized before we do anything else
            new MapGenerator().doIt()

            const playerStartPos = new Point(1, 1).times(MapGenerator.MAP_SIZE/2 * TILE_SIZE)
                    .plusY(-TILE_SIZE * 10)
                    .plusX(TILE_SIZE * 2)
            const playerDude = DudeFactory.instance.new(DudeType.PLAYER, playerStartPos)

            Camera.instance.focusOnDude(playerDude)

            DudeFactory.instance.new(DudeType.DIP, new Point(-10, -10))

            CutsceneManager.instance.startCutscene(new IntroCutscene())
        }
    }

    // entities in the world space
    getViews(updateViewsContext: UpdateViewsContext): View[] {
        // TEMPORARY TEST INPUTS
        // if (updateViewsContext.input.isKeyDown(InputKey.J)) {
        //     this.save()
        // } else if (updateViewsContext.input.isKeyDown(InputKey.K)) {
        //     this.load()
        // }
        if (updateViewsContext.input.isKeyDown(InputKey.L)) {
            DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(40, 30))
        }




        this.updateViews(updateViewsContext)
        return [
            this.gameEntityView, 
            this.uiView
        ]
    }

    updateViews(updateViewsContext: UpdateViewsContext) {
        const dimensions = updateViewsContext.dimensions.div(ZOOM)
        const cameraGoal = Camera.instance.getGoalPosition(dimensions)

        this.gameEntityView = { 
            zoom: ZOOM,
            offset: !this.gameEntityView ? cameraGoal : this.gameEntityView.offset.lerp(.0018 * updateViewsContext.elapsedTimeMillis, cameraGoal),
            entities: LocationManager.instance.currentLocation.getEntities()
                    .concat(CutsceneManager.instance.getEntities())
        }

        this.uiView = {
            zoom: ZOOM,
            offset: Point.ZERO,
            entities: UIStateManager.instance.get(dimensions)
        }
    }
}
