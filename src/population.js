import { Species } from "./species";

export class Population {
    constructor(players) {
        this.species = [new Species(players)];
    }
}