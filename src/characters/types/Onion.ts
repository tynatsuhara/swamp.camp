import { AwakeData, Component } from "brigsby/dist"
import { Dude } from "../Dude"
import { ONION_DIALOGUE_ENTRYPOINT } from "../dialogue/OnionDialogue"

export class Onion extends Component {
    awake(awakeData: AwakeData): void {
        this.entity.getComponent(Dude).dialogue = ONION_DIALOGUE_ENTRYPOINT
    }
}
