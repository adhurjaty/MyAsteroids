import { Species } from "./species";

export class Population {
    constructor(players) {
        this.species = [new Species(players)];
        this.initGlobalInnoHistory(players[0].brain);
    }

    initGlobalInnoHistory(genome) {
        Population.innovationHistory = genome.geneHistory;
    }
}