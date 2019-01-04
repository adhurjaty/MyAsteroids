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

const POP_SIZE = 100,
      GENERATIONS = 60;

var canvas = null;
var debugButton = null;
var debugGame = false;
var _game = null;

function showProgress(population) {
    window.setTimeout(() => {
        clearProgCharts();
        var speciation = population.getSpeciation();
        speciationChart(speciation, '#speciation-chart');
        
        var fitnesses = population.getFitnesses();
        var fc = makeFintessChart(fitnesses);
        fc.bind('#fitness-chart');
        fc.render();

        var bestPlayer = population.getBestPlayer();
        drawNN(bestPlayer);
    }, 0);
}

function clearProgCharts() {
    ["nn-visualizer", "speciation-chart", "fitness-chart"].forEach(c => {
        var node = document.getElementById(c);
        node.innerHTML = '';
    });
}

function drawNN(player) {
    var nn = player.brain.toJson();
    graphNN(nn, '#nn-visualizer');

    document.getElementById('nn-visualizer').style.display = 'block';
}

function trainingComplete(population) {
    canvas.style.display = 'block';
    debugButton.style.display = 'block';
    
    var bestPlayers = population.getBestNPlayers(5);
    createPlayerButtons(bestPlayers);
}

function createPlayerButtons(players) {
    var container = document.getElementById('button-holder');
    container.innerHTML = '';
    players.forEach((player, i) => {
        var li = document.createElement('li');
        var button = document.createElement('button');
        button.onclick = ((player) => {
            return () => startGame(player);
        })(player);

        var buttonContent = document.createTextNode(`Species ${i+1}`);
        button.appendChild(buttonContent);
        li.appendChild(button);
        container.append(li);
    });
}

function startGame(player) {
    if(_game != null) {
        _game.gameOver = true;
    }

    drawNN(player);

    // seedrandom('randomseed', {global: true});
    _game = new AiDisplayGame(canvas, player, debugGame);
    _game.start();
}

function setDebugButton() {
    debugButton = document.getElementById('debug-button');

    debugButton.onclick = () => { 
        debugGame = !debugGame;
        if(_game != null) {
            _game.debug = debugGame;
        }
    };

    debugButton.style.display = 'none';
}

window.onload = () => {
    canvas = document.getElementById('game-canvas');
    
    setDebugButton();

    if(canvas.getContext) {
        canvas.setAttribute('width', CANVAS_WIDTH);
        canvas.setAttribute('height', CANVAS_HEIGHT);
        
        var context = canvas.getContext('2d');
        context.fillStyle = 'rgb(255, 255, 255)';
        context.strokeStyle = 'rgb(255, 255, 255)';

        canvas.style.display = 'none';
        var pop = new Population(POP_SIZE);
        pop.train(GENERATIONS, showProgress, trainingComplete);

        // debugButton.style.display = 'block';
        // _game = new HumanGame(canvas, debugGame);
        // _game.start();
    }
}