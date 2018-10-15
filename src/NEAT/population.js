import { Species } from "./species";
import { Player } from "./player";
import { AiTrainingGame } from "../GameTypes/aiTrainingGame";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../app";
import { arrayMax } from "../util";

const STALE_THRESHOLD = 15;

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
        var players = this.getAllPlayers();
        for(var i = 0; i < players.length; i++) {
            var player = players[i];
            var game = new AiTrainingGame(CANVAS_WIDTH, CANVAS_HEIGHT, player);
            game.start();
        }
        this.updatePopulation();
    }

    updatePopulation() {
        this.writeSpeciesResults();
        this.greatDying();
        this.reproduce();
        this.speciate();
    }

    writeSpeciesResults() {
        for(var i = 0; i < this.species.length; i++) {
            this.species[i].updateResults();
        }
    }

    greatDying() {
        // this.extinctSpecies();
        this.extinctStaleSpecies();
        this.cullSpecies();
    }

    // extinctSpecies() {
    //     this.extinctStaleSpecies();
    //     this.extinctMorons();
    // }

    extinctStaleSpecies() {
        this.species = this.species.filter(s => s.staleness < STALE_THRESHOLD);
    }

    cullSpecies() {
        for(var i = 0; i < this.species.length; i++) {
            this.species.cull();
        }
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

    speciate() {
        this.species.forEach(s => {
            s.clear();
        });

        var players = this.getAllPlayers();
        for(var i = 0; i < players.length; i++) {
            var j;
            for(j = 0; j < this.species.length; j++) {
                if(this.species[j].sameSpecies(players[i])) {
                    this.species[j].addPlayer(players[i]);
                    break;
                }
            }
            if(j == this.species.length) {
                this.species.push(new Species([player[i]]));
            }
        }
    }

    getBestPlayer() {
        return arrayMax(this.getAllPlayers(), (p) => p.fitness);
    }

    getAllPlayers() {
        return this.species.map((s) => s.players).flat();
    }
}