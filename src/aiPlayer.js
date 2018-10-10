import { Game } from "./game";
import { VectorCalculator } from "./vectorCalculator";

const ACTION_INTERVAL = 10; // number of timesteps to skip per new AI decision

export class AiPlayer {
    constructor(game) {
        this.game = game;
    }

    start() {
        var counter = -1;
        while(true) {
            this.game.update(this.game);
            counter++;
            if(counter >= ACTION_INTERVAL) {
                var state = this.game.getState();
                var moves = this.calculateMoves(state);
                for(var action in moves) {
                    if(moves[action] > .5) {
                        this.game.inputAction(action);
                    } else {
                        this.game.stopAction(action);
                    }
                }
                counter = 0;
            }
        }
    }

    calculateMoves(state) {
        var vecCalc = new VectorCalculator(state);
        var vector = vecCalc.getVector();

    }
}