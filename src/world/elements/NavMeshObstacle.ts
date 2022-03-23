import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { Location } from "../Location"

export class NavMeshObstacle extends Component {
    private readonly location: Location
    private readonly position: Point

    /**
     * @param position tile position
     */
    constructor(location: Location, position: Point) {
        super()
        this.location = location
        this.position = position

        this.location.setOccupied(this.position, true)
    }

    delete() {
        this.location.setOccupied(this.position, false)
        super.delete()
    }
}