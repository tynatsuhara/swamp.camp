import { Component } from "brigsby/lib"

export abstract class Simulatable extends Component {
    abstract simulate(duration: number): void
}
