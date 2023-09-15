import { Component } from "brigsby/dist"

export class Dip extends Component {
    static instance: Dip

    constructor() {
        super()
        Dip.instance = this
    }
}
