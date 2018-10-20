import { DisplayGame } from "./displayGame";
import { ACTION_THRESHOLD } from "../NEAT/player";
import { Point } from "../util";
import { SHOT_DISTANCE, VectorCalculator } from "../vectorCalculator";

const THOUGHT_INTERVAL = 200;   // milliseconds between each AI move

export class AiDisplayGame extends DisplayGame {
    constructor(canvas, player) {
        super(canvas);
        this.player = player;
    }

    start() {
        super.start();

        var self = this;
        this.thoughtHandle = setInterval(() => self.makeMove(), THOUGHT_INTERVAL);
    }

    endGame() {
        super.endGame();
        clearInterval(this.thoughtHandle);
    }

    makeMove() {
        var state = this.getState();
        var moves = this.player.calculateMoves(state);

        for(var action in moves) {
            if(moves[action] > ACTION_THRESHOLD) {
                this.inputAction(parseInt(action));
            } else {
                this.stopAction(parseInt(action));
            }
        }
    }

    draw() {
        super.draw();
        this.drawVision();
    }

    drawVision() {
        var canvasStart = this.convertToDrawCoords(this.ship.cp);

        var vecCalc = new VectorCalculator(this.getState());
        var vector = vecCalc.getVector();

        for(var i = 0; i < 16; i++) {
            var angle = i * Math.PI / 8;
            var absAngle = (angle + this.ship.theta) % (2 * Math.PI);
            var endpoint = this.ship.cp.add(Point.fromPolar(SHOT_DISTANCE, absAngle));

            var canvasEnd = this.convertToDrawCoords(endpoint);

            if(vector[2*i] > 0) {
                this.ctx.lineWidth = 3;
            } else {
                this.ctx.lineWidth = 1;
            }
            this.ctx.moveTo(...canvasStart.toArray());
            this.ctx.lineTo(...canvasEnd.toArray());
            this.ctx.stroke();
        }
    }
}