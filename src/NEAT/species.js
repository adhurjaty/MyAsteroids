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

    killPlayer(player) {
        var idx = this.players.indexOf(player);
        this.players.splice(idx, 1);
    }

    reproduce() {
        var newGeneration = [];
        for(var i = 0; i < this.players.length; i++) {
            var newPlayer = this.players[i].clone();
            newPlayer.brain.mutate();
            newGeneration.push(newPlayer);
        }

        this.players = this.players.concat(newGeneration);
    }
}