import { Component } from "brigsby/dist/Component"

export abstract class Simulatable extends Component {
    simulate(duration: number): void {}
}
