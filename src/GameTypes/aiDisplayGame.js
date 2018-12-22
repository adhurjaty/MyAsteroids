import { DisplayGame } from "./displayGame";
import { ACTION_THRESHOLD } from "../NEAT/player";


const ACTION_INTERVAL = 15;   // milliseconds between each AI move

export class AiDisplayGame extends DisplayGame {
    constructor(canvas, player) {
        super(canvas);
        this.player = player;
        this.counter = 0;
    }

    update() {
        this.counter++;
        super.update();

        if(this.counter % ACTION_INTERVAL == 0) {
            this.makeMove();
        }
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