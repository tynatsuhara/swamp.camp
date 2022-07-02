import { Component } from "brigsby/dist"

export abstract class Simulatable extends Component {
    abstract simulate(duration: number): void
}
