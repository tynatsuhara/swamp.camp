import { Component, Point } from "brigsby/lib"
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
