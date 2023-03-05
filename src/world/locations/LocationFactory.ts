import { Singletons } from "../../Singletons"
import { CampLocationGenerator } from "./CampLocationGenerator"
import { RadiantLocationGenerator } from "./RadiantLocationGenerator"

export class LocationFactory {
    static get instance() {
        return Singletons.getOrCreate(LocationFactory)
    }

    private camp = new CampLocationGenerator()
    private radiant = new RadiantLocationGenerator()

    newCamp() {
        return this.camp.generate()
    }

    newRadiantLocation() {
        return this.radiant.generate()
    }
}
