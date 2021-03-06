import { Game, MOVE_ENUM } from "./game";
import { ACTION_THRESHOLD } from "../NEAT/player";

export const ACTION_INTERVAL = 10; // number of timesteps to skip per new AI decision
const LIFETIME_FITNESS_GAIN = 1/10,
      SCORE_GAIN = 1;

export class AiTrainingGame extends Game {
    constructor(width, height, player) {
        super(width, height);
        this.player = player;
        this.counter = 0;
    }

    start() {
        while(!this.gameOver) {
            this.counter++;
            this.update();

            if(this.counter % ACTION_INTERVAL == 0) {
                this.makeMove();
            }
        }

        this.player.setFitness(this.getFitness());
        this.player.score = this.score;
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

    getFitness() {
        // return this.score ** 2 * SCORE_GAIN + this.counter * LIFETIME_FITNESS_GAIN;
        // var minHitRate = .02;
        // var hitRate = this.shotsFired > 0 
        //     ? this.shotsHit / this.shotsFired
        //     : minHitRate;
        // hitRate = Math.max(minHitRate, hitRate)
        // return (this.score + 1) ** 2 * this.counter * Math.sqrt(hitRate) / 100;

        // var invSuprisal = this.maxSuprisal > 0 ? 1 / this.maxSuprisal : 1;
        // return (this.score + 1) * this.counter * invSuprisal;
        return this.score * this.counter;
    }
}