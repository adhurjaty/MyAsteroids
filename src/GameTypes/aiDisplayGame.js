import { DisplayGame } from "./displayGame";

const THOUGHT_INTERVAL = 200,
      ACTION_THRESHOLD = .7;   // milliseconds between each AI move

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
                this.inputAction(action);
            } else {
                this.stopAction(action);
            }
        }
    }
}