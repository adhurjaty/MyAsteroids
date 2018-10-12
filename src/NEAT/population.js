import { Species } from "./species";
import { Player } from "./player";
import { AiTrainingGame } from "../GameTypes/aiTrainingGame";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../app";
import { arrayMax } from "../util";

export class Population {
    static setInnovationNumber(connGene) {
        for(var i = 0; i < Population.innovationHistory.length; i++) {
            var existingConnGene = Population.innovationHistory[i];
            if(existingConnGene.inGene.id == connGene.inGene.id) {
                if(Population.matchesConnectionPath(existingConnGene.outGene, connGene.outGene)) {
                    var innNo = existingConnGene.innovationNumber;
                    connGene.innovationNumber = innNo;
                    return;
                }
            }
        }

        connGene.innovationNumber = Population.innovationHistory.length + 1;
        Population.innovationHistory.push(connGene);
    }

    static matchesConnectionPath(gene, otherGene) {
        if(gene.connections.length == otherGene.connections.length) {
            for(var i = 0; i < gene.connections.length; i++) {
                if(gene.connections[i].id != otherGene.connections[i].id) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    constructor(num) {
        var players = Array(num).fill(new Player());
        this.species = [new Species(players)];
        this.initGlobalInnoHistory(players[0].brain);
    }

    initGlobalInnoHistory(genome) {
        Population.innovationHistory = genome.geneHistory;
    }

    train(generations) {
        for(var i = 0; i < generations; i++) {
            this.runGeneration();
        }
    }

    runGeneration() {
        debugger;
        for(var i = 0; i < this.species.length; i++) {
            for(var j = 0; j < this.species[i].players.length; j++) {
                var player = this.species[i].players[j];
                var game = new AiTrainingGame(CANVAS_WIDTH, CANVAS_HEIGHT, player);
                game.start();
            }
        }
        this.updatePopulation();
    }

    updatePopulation() {
        this.cullPopulation();
        this.reproduce();
    }

    cullPopulation() {
        var playersBySpec = this.getAllPlayersBySpecies();
        playersBySpec.sort((a, b) => b.player.fitness - a.player.fitness);
        for(var i = playersBySpec.length / 2; i < playersBySpec.length; i++) {
            var spec = playersBySpec[i].species
            spec.killPlayer(playersBySpec[i].player);
            if(spec.players.length == 0) {
                this.extinctSpecies(spec);
            }
        }
    }

    extinctSpecies(species) {
        var idx = this.species.indexOf(species);
        this.species.splice(idx, 1);
    }

    getAllPlayersBySpecies() {
        return this.species.map((spec) => {
            return spec.players.map((player) => {
                return { species: spec, player: player };
            });
        }).flat();
    }

    reproduce() {
        this.species.forEach((spec) => spec.reproduce());
    }

    getBestPlayer() {
        return arrayMax(this.getAllPlayersBySpecies(), (pbs) => pbs.player.fitness);
    }
}