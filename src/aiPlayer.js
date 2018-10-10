import { Game } from "./game";

export class AiPlayer {
    constructor(game) {
        this.game = game;
    }

    start() {
        while(true) {
            this.game.update(this.game);
            var state = this.game.getState();
            var moves = this.calculateMoves(state);
            for(var action in moves) {
                if(moves[action] > .5) {
                    this.game.inputAction(action);
                } else {
                    this.game.stopAction(action);
                }
            }
        }
    }

    calculateMoves(state) {
        
    }
}