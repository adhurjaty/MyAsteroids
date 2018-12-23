import './styles/app.css';
import { HumanGame } from './GameTypes/humanGame.js';
import { AiDisplayGame } from './GameTypes/aiDisplayGame';
import { Population } from './NEAT/population.js';
import { graphNN } from './Graphing/networkVis.js';
import { speciationChart } from './Graphing/speciationChart';
import { makeFintessChart } from './Graphing/fitnessChart';
import seedrandom from 'seedrandom';

export const CANVAS_WIDTH = 1000,
             CANVAS_HEIGHT = 700;

const POP_SIZE = 2000,
      GENERATIONS = 60;

var canvas = null;

function clearProgCharts() {
    ["speciation-chart", "fitness-chart"].forEach(c => {
        var node = document.getElementById(c);
        node.innerHTML = '';
    });
}

function showProgress(population) {
    window.setTimeout(() => {
        clearProgCharts();
        var speciation = population.getSpeciation();
        speciationChart(speciation, '#speciation-chart');
        
        var fitnesses = population.getFitnesses();
        var fc = makeFintessChart(fitnesses);
        fc.bind('#fitness-chart');
        fc.render();
    }, 0);
}

function trainingComplete(population) {
    canvas.style.display = 'block';
    
    var player = population.getBestPlayer();
    var nn = player.brain.toJson();
    graphNN(nn, '#nn-visualizer');
    document.getElementById('nn-visualizer').style.display = 'block';

    // seedrandom('randomseed', {global: true});
    var game = new AiDisplayGame(canvas, player);
    game.start();
}

window.onload = () => {
    canvas = document.getElementById('game-canvas');

    if(canvas.getContext) {
        canvas.setAttribute('width', CANVAS_WIDTH);
        canvas.setAttribute('height', CANVAS_HEIGHT);
        
        var context = canvas.getContext('2d');
        context.fillStyle = 'rgb(255, 255, 255)';
        context.strokeStyle = 'rgb(255, 255, 255)';

        canvas.style.display = 'none';
        var pop = new Population(POP_SIZE);
        pop.train(GENERATIONS, showProgress, trainingComplete);

        // var game = new HumanGame(canvas);
        // game.start();
    }
}