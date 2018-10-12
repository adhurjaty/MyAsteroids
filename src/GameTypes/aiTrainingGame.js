import { Game } from "./game";
import { ACTION_THRESHOLD } from "../NEAT/player";

const ACTION_INTERVAL = 15; // number of timesteps to skip per new AI decision

export class AiTrainingGame extends Game {
    constructor(width, height, player) {
        super(width, height);
        this.player = player;
    }

    start() {
        var counter = 0;
        while(!this.gameOver) {
            counter++;
            this.update();

            if(counter == ACTION_INTERVAL) {
                counter = 0;
                this.makeMove();
            }
        }

        this.player.setFitness(this.getFitness());
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

    getFitness() {
        return this.score;
    }
}