import { INPUT_NEURONS, OUTPUT_NEURONS } from "./player";

const C1 = 1.5,
      C2 = 1.8,
      C3 = 0.8,
      DISTANCE_THRESHOLD;

export class Species {
    constructor(players) {
        this.players = players;
        this.bestPlayer = players[0];
        this.staleness = 0;
    }

    updateResults() {
        this.players.sort((a, b) => b.fitness - a.fitness);
        this.setBestPlayer();
    }

    setBestPlayer() {
        if(this.players[0].fitness > this.bestPlayer.fitness) {
            this.bestPlayer = this.players[0];
            this.staleness = 0;
        } else {
            this.staleness++;
        }
    }

    sameSpecies(otherPlayer) {
        var excessDisjointMatching = this.bestPlayer.brain.getExcessDisjointMatching(otherPlayer.brain);
        var excess = excessDisjointMatching.otherExcess;
        var disjoint = excessDisjointMatching.otherDisjoint;
        var matching = excessDisjointMatching.matching;

        var distance = (C1 * excess.length + C2 * disjoint.length) / this.players.length 
                        + C3 * this.getAvgWeightDiff(matching);
        return distance < DISTANCE_THRESHOLD;
    }

    getAvgWeightDiff(matchingGenes) {
        var totalWeightDiff = 0;
        for(var i = 0; i < matchingGenes.length; i++) {
            var gene = matchingGenes[i].original;
            var otherGene = matchingGenes[i].other;
            totalWeightDiff += Math.abs(gene.weight - otherGene.weight);
        }

        return totalWeightDiff / matchingGenes.length;
    }

    killPlayer(player) {
        var idx = this.players.indexOf(player);
        this.players.splice(idx, 1);
    }

    reproduce() {
        var newPlayer = null;

        if(Math.random() < .25) {
            newPlayer = getParent().clone();
        } else {
            var mom = getParent();
            var dad = getParent(mom);
            newPlayer = mom.haveSexWith(dad);
        }

        newPlayer.brain.mutate();
        if(!this.sameSpecies(newPlayer)) {
            return newPlayer;
        }

        return null;
    }

    cull() {
        this.players = this.players.slice(0, Math.ceil(this.players.length/2));
    }

    setPlayers(players) {
        this.players = players;
    }

    addPlayer(player) {
        this.players.push(player);
    }

    clear() {
        this.players = [];
    }
}