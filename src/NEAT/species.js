import { INPUT_NEURONS, OUTPUT_NEURONS } from "./player";

export class Species {
    constructor(players) {
        this.players = players;
    }

    mutateGenome(genome) {
        
    }

    createConnection(genome) {
        if(genome.fullyConnected()) {
            return null;
        }

        
    }

    addConnGene(connGene, genome) {
        if(genome.connectionExists(connGene)) {
            return;
        }
        var innNo = this.getInnovationNumber(connGene);
        if(innNo > this.innovationNumber) {
            this.innovationNumber = innNo;
        }

        genome.addConnection(connGene);
    }

    getInnovationNumber(connGene) {

    }
}