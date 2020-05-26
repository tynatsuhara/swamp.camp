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
import { BasicRenderComponent } from "../engine/renderer/BasicRenderComponent"
import { Entity } from "../engine/Entity"
import { TintRender } from "../engine/renderer/TintRender"
import { PointLightMaskRenderer } from "./world/PointLightMaskRenderer"


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
        new PointLightMaskRenderer()

        const newGame = !SaveManager.instance.load()

        if (newGame) {
            // World must be initialized before we do anything else
            new MapGenerator().doIt()

            const playerStartPos = new Point(1, 1).times(MapGenerator.MAP_SIZE/2 * TILE_SIZE)
                    .plusY(-TILE_SIZE * 10)
                    .plusX(TILE_SIZE * 2)
            const playerDude = DudeFactory.instance.new(DudeType.PLAYER, playerStartPos)

            Camera.instance.focusOnDude(playerDude)

            DudeFactory.instance.new(DudeType.DIP, Point.ZERO)
            // DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(3, 1).times(TILE_SIZE))
            // DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(-1, 3).times(TILE_SIZE))
            // DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(-4, 0).times(TILE_SIZE))

            // TODO clean up obstacles (trees, rocks, etc) so intro goes smoothly
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
        const cameraOffset = Camera.instance.updatePosition(dimensions, updateViewsContext.elapsedTimeMillis)

        this.gameEntityView = { 
            zoom: ZOOM,
            offset: cameraOffset,
            entities: LocationManager.instance.currentLocation.getEntities()
                    .concat(CutsceneManager.instance.getEntities())
                    .concat(PointLightMaskRenderer.instance.getEntities())
        }

        this.uiView = {
            zoom: ZOOM,
            offset: Point.ZERO,
            entities: UIStateManager.instance.get(dimensions, updateViewsContext.elapsedTimeMillis)
        }
    }
}
