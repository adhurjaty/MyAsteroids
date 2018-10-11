import { HumanGame } from './humanGame.js';

var canvasWidth = 1000;
var canvasHeight = 700;

window.onload = () => {
    var canvas = document.getElementById('game-canvas');
    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);

    if(canvas.getContext) {
        var context = canvas.getContext('2d');

        context.fillStyle = 'rgb(255, 255, 255)';
        context.strokeStyle = 'rgb(255, 255, 255)';

        var game = new HumanGame(canvas);
        game.start();
    }
}