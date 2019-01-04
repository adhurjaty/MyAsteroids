import { Species } from "./species";
import { Player } from "./player";
import { AiTrainingGame } from "../GameTypes/aiTrainingGame";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../app";
import { arrayMax } from "../util";
import seedrandom from 'seedrandom';

const STALE_THRESHOLD = 15,
      SPECIES_TO_DISPLAY = 5,
      CLONE_BEST = 5;

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
        seedrandom('randomseed', {global: true});

        this.initPlayers();
        this.species = [new Species(this.players, 0)];
        this.specId = 1;
        this.initGlobalInnoHistory(this.players[0].brain);
        this.speciation = [];
        this.scoreByGen = [];
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
        var genSeed = Math.random();
        for(var i = 0; i < players.length; i++) {
            var player = players[i];

            // ensure each game within a generation is the same by
            // seeding with the same random seed
            // seedrandom('randomseed' + genSeed, {global: true});
            var game = new AiTrainingGame(CANVAS_WIDTH, CANVAS_HEIGHT, player);
            game.start();
        }
        this.updatePopulation();
    }

    updatePopulation() {
        this.writeSpeciesResults();
        this.sortSpecies();

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
            var numOffspring = specPopSize - spec.players.length;
            if(numOffspring < 0) {
                spec.cullAmount(-numOffspring);
            } else {
                var mutants = self.reproduceSpecies(spec, numOffspring);
                newSpeciesPlayers = newSpeciesPlayers.concat(mutants);
            }
        });

        var curPop = this.getAllPlayers().length;
        var bestSpecies = this.species[0];
        var mutants = this.reproduceSpecies(bestSpecies,
            this.size - curPop);
        newSpeciesPlayers = newSpeciesPlayers.concat(mutants);

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

    getBestNPlayers(num) {
        return this.species.slice(0, num).map(x => x.bestPlayer);
    }

    getAllPlayers() {
        return this.species.map((s) => s.players).flat();
    }

    updateGraphs(generation) {
        var spec = {
            generation: generation
        };
        var players = this.getAllPlayers();
        var avgScore = players.reduce((sum, x) => sum + x.score,
                        0) / players.length;

        var scores = {
            generation: generation,
            avg: avgScore
        };
        var playerSum = 0;
        for(var i = 0; i < this.species.length; i++) {
            // var bestFitess = this.species[i].bestPlayer.fitness;
            var bestScore = Math.max(...this.species[i].players.map(x => x.score));
            scores[this.species[i].id] = bestScore;
            spec[this.species[i].id] = this.species[i].players.length;
        }
        this.speciation.push(spec);
        this.scoreByGen.push(scores);
    }

    getSpeciation() {
        return this.speciation;
    }

    getScores() {
        return this.scoreByGen;
    }
}