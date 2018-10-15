import { INPUT_NEURONS, OUTPUT_NEURONS } from "./player";
import { shuffle, randomInt } from "../util";

const C1 = 0.15,
      C2 = 0.28,
      C3 = 0.6,
      DISTANCE_THRESHOLD = 1;

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
        var norm = Math.max(otherPlayer.brain.geneHistory.length, this.bestPlayer.brain.geneHistory.length);

        var distance = (C1 * excess.length + C2 * disjoint.length) / norm
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

    getAvgFitness() {
        return this.players.reduce((sum, p) => {
            return sum + p.fitness;
        }, 0) / this.players.length;
    }

    killPlayer(player) {
        var idx = this.players.indexOf(player);
        this.players.splice(idx, 1);
    }

    reproduce() {
        var newPlayer = null;

        if(Math.random() < .25) {
            newPlayer = this.getParent().clone();
        } else {
            var mom = this.getParent();
            var dad = this.getParent();
            newPlayer = mom.haveSexWith(dad);
        }

        newPlayer.brain.mutate();
        if(!this.sameSpecies(newPlayer)) {
            debugger;
            return newPlayer;
        }

        this.players.push(newPlayer);
        return null;
    }

    getParent() {
        var shuffledPlayers = shuffle(this.players);
        var totalFitness = this.getTotalFitness();
        var runningTotal = 0;
        var target = randomInt(0, totalFitness);
        for(var i = 0; i < shuffledPlayers.length; i++) {
            runningTotal += shuffledPlayers[i].fitness;
            if(runningTotal >= target) {
                return shuffledPlayers[i]
            }
        }

        return shuffledPlayers[shuffledPlayers.length - 1];
    }

    getTotalFitness() {
        return this.players.reduce((sum, player) => {
            return sum + player.fitness;
        }, 0);
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