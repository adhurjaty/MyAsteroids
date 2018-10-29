import './styles/app.css';
import { HumanGame } from './GameTypes/humanGame.js';
import { AiDisplayGame } from './GameTypes/aiDisplayGame';
import { Population } from './NEAT/population.js';
import { graphNN } from './Graphing/networkVis.js';
import { speciationChart } from './Graphing/speciationChart';
import { makeFintessChart } from './Graphing/fitnessChart';

export const CANVAS_WIDTH = 1000,
             CANVAS_HEIGHT = 700;


function showProgress(population) {
    var speciation = population.getSpeciation();
    speciationChart(speciation);

    var fitnesses = population.getFitnesses();
    var fc = makeFintessChart(fitnesses);
    fc.bind('#fitness-chart');
    fc.render();
}

window.onload = () => {
    var canvas = document.getElementById('game-canvas');
    canvas.style.display = 'none';

    if(canvas.getContext) {
        var pop = null;
        // (async () => {
            pop = new Population(100);
            pop.train(10);//, showProgress);
        // })().then(() => {
            canvas.setAttribute('width', CANVAS_WIDTH);
            canvas.setAttribute('height', CANVAS_HEIGHT);
            canvas.style.display = 'block';
    
            var context = canvas.getContext('2d');
    
            context.fillStyle = 'rgb(255, 255, 255)';
            context.strokeStyle = 'rgb(255, 255, 255)';
    
            var speciation = pop.getSpeciation();
            speciationChart(speciation);

            var fitnesses = pop.getFitnesses();
            var fc = makeFintessChart(fitnesses);
            fc.bind('#fitness-chart');
            fc.render();
            // var game = new HumanGame(canvas);
            // game.start();
    
            var player = pop.getBestPlayer();
    
            var nn = player.brain.toJson();
            graphNN(nn);
    
            var game = new AiDisplayGame(canvas, player);
            game.start();
        //});

    }
}