import { Species } from "./species";
import { Player } from "./player";
import { AiTrainingGame } from "../GameTypes/aiTrainingGame";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../app";
import { arrayMax } from "../util";

const STALE_THRESHOLD = 15;

export class Population {
    static setInnovationNumber(connGene) {
        var matchingInnNo = Population.getMatchingInnNo(connGene);
        if(matchingInnNo > -1) {
            connGene.innovationNumber = matchingInnNo;
            return;
        }

        connGene.innovationNumber = Population.innovationHistory.length + 1;
        Population.innovationHistory.push(connGene);
    }

    static getMatchingInnNo(connGene) {
        for(var i = 0; i < Population.innovationHistory.length; i++) {
            var existingConnGene = Population.innovationHistory[i];
            if(existingConnGene.inGeneId == connGene.inGeneId
                && existingConnGene.outGeneId == connGene.outGeneId) {
                return existingConnGene.innovationNumber;
            }
        }
    }

    constructor(num) {
        this.size = num;
        this.initPlayers();
        this.species = [new Species(this.players, 0)];
        this.specId = 1;
        this.initGlobalInnoHistory(this.players[0].brain);
        this.speciation = [];
        this.fitnessByGen = [];
        this.bestPlayer = null;
    }

    initPlayers() {
        this.players = [];
        for(var i = 0; i < this.size; i++) {
            this.players.push(new Player());
        }
    }

    initGlobalInnoHistory(genome) {
        Population.innovationHistory = genome.geneHistory.slice(0);
    }

    train(generations, showProgress, trainingComplete) {
        var progInterval = Math.max(generations / 100, 1);

        function trainGeneration(i) {
            if(i == generations) {
                trainingComplete(this);
                return;
            }
            this.runGeneration();
            if(i % progInterval == 0) {
                this.updateGraphs(i);
                showProgress(this);
            }
            var fn = trainGeneration.bind(this, i + 1);
            window.requestAnimationFrame(fn);
        }

        var trainFn = trainGeneration.bind(this, 0);
        window.requestAnimationFrame(trainFn);
    }

    runGeneration() {
        var players = this.getAllPlayers();
        for(var i = 0; i < players.length; i++) {
            var player = players[i];
            var game = new AiTrainingGame(CANVAS_WIDTH, CANVAS_HEIGHT, player);
            game.start()
        }
        this.updatePopulation();
    }

    updatePopulation() {
        this.writeSpeciesResults();
        this.sortSpecies();

        if(this.bestPlayer == null ||
            this.species[0].bestPlayer.fitness > this.bestPlayer.fitness) {
            this.bestPlayer = this.species[0].bestPlayer;
        }

        this.greatDying();
        this.reproduce();
    }

    writeSpeciesResults() {
        for(var i = 0; i < this.species.length; i++) {
            this.species[i].updateResults();
        }
    }

    sortSpecies() {
        this.species.sort((a, b) => b.bestPlayer.fitness - a.bestPlayer.fitness);
    }

    greatDying() {
        this.extinctSpecies();
        this.cullSpecies();
    }

    extinctSpecies() {
        this.extinctStaleSpecies();
        this.extinctUnderperformers();
    }

    extinctStaleSpecies() {
        this.species = this.species.filter((s, i) => i == 0 || s.staleness < STALE_THRESHOLD);
    }

    extinctUnderperformers() {
        var self = this;
        var avgFitnessSum = this.getAvgFitnessSum();
        this.species = this.species.filter(s => self.getSpeciesPopSize(s, avgFitnessSum) > 1);
    }

    cullSpecies() {
        this.species.forEach(s => s.cull());
    }

    reproduce() {
        var self = this;
        var avgFitnessSum = this.getAvgFitnessSum();
        var newSpeciesPlayers = [];
        this.species.forEach((spec) => {
            var specPopSize = self.getSpeciesPopSize(spec, avgFitnessSum);
            newSpeciesPlayers = newSpeciesPlayers.concat(self.reproduceSpecies(spec, specPopSize - spec.players.length));
        });

        var curPop = this.getAllPlayers().length;
        var bestSpecies = this.species[0];
        newSpeciesPlayers = newSpeciesPlayers.concat(
            this.reproduceSpecies(bestSpecies, this.size - curPop));

        this.speciate(newSpeciesPlayers);
    }

    getAvgFitnessSum() {
        return this.species.reduce((sum, s) => {
            return sum + s.getAvgFitness();
        }, 0);
    }

    getSpeciesPopSize(species, avgFitnessSum) {
        var avgFitness = species.getAvgFitness();
        return Math.floor(this.size * avgFitness / avgFitnessSum);
    }

    reproduceSpecies(spec, num) {
        var newSpeciesPlayers = [];
        for(var i = 0; i < num; i++) {
            var newSpeciesPlayer = spec.reproduce();
            if(newSpeciesPlayer != null) {
                newSpeciesPlayers.push(newSpeciesPlayer);
            }
        }

        return newSpeciesPlayers;
    }

    speciate(players) {
        for(var i = 0; i < players.length; i++) {
            var j;
            for(j = 0; j < this.species.length; j++) {
                if(this.species[j].sameSpecies(players[i])) {
                    this.species[j].addPlayer(players[i]);
                    break;
                }
            }
            if(j == this.species.length) {
                this.species.push(new Species([players[i]], this.specId));
                this.specId++;
            }
        }
    }

    getBestPlayer() {
        return arrayMax(this.getAllPlayers(), (p) => p.fitness);
        // return this.bestPlayer;
    }

    getAllPlayers() {
        return this.species.map((s) => s.players).flat();
    }

    updateGraphs(generation) {
        var spec = {
            generation: generation
        };
        var fitnesses = {
            generation: generation
        };
        for(var i = 0; i < this.species.length; i++) {
            spec[this.species[i].id] = this.species[i].players.length;
            fitnesses[this.species[i].id] = this.species[i].getAvgFitness();
        }
        this.speciation.push(spec);
        this.fitnessByGen.push(fitnesses);
    }

    getSpeciation() {
        return this.speciation;
    }

    getFitnesses() {
        return this.fitnessByGen;
    }
}