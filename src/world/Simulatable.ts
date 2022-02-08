import { Component } from "brigsby/dist/Component"

export abstract class Simulatable extends Component {
    abstract simulate(duration: number): void
}
