import { DisplayGame } from "./displayGame";
import { ACTION_THRESHOLD } from "../NEAT/player";

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
}