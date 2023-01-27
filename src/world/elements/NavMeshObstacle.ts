import { Component, Point } from "brigsby/dist"
import { Location } from "../locations/Location"

export class NavMeshObstacle extends Component {
    /**
     * @param position tile position
     */
    constructor(private readonly location: Location, private readonly position: Point) {
        super()

        this.location.setOccupied(this.position, true)
    }

    delete() {
        this.location.setOccupied(this.position, false)
        super.delete()
    }
}
