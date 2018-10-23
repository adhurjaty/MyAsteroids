import './styles/app.css';
import './styles/lineChart.css';
import { HumanGame } from './GameTypes/humanGame.js';
import { AiDisplayGame } from './GameTypes/aiDisplayGame';
import { Population } from './NEAT/population.js';
import { Player } from './NEAT/player.js';
import { graphNN } from './Graphing/networkVis.js';
import { speciationChart } from './Graphing/speciationChart';
import { makeFintessChart } from './Graphing/fitnessChart';

export const CANVAS_WIDTH = 1000,
             CANVAS_HEIGHT = 700;

window.onload = () => {
    var canvas = document.getElementById('game-canvas');
    canvas.setAttribute('width', CANVAS_WIDTH);
    canvas.setAttribute('height', CANVAS_HEIGHT);

    if(canvas.getContext) {
        var context = canvas.getContext('2d');

        context.fillStyle = 'rgb(255, 255, 255)';
        context.strokeStyle = 'rgb(255, 255, 255)';

        // var game = new HumanGame(canvas);
        // game.start();

        // var player = new Player();
        // var game = new AiDisplayGame(canvas, player);
        // game.start();
        
        var pop = new Population(100);
        pop.train(10);
        var player = pop.getBestPlayer();

        var nn = player.brain.toJson();
        graphNN(nn);

        var speciation = pop.getSpeciation();
        speciationChart(speciation);

        var fitnesses = pop.getFitnesses();
        debugger;
        var fc = makeFintessChart(fitnesses);
        fc.bind('#fitness-chart');
        fc.render();

        var game = new AiDisplayGame(canvas, player);
        game.start();
    }
}