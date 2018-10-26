import { VectorCalculator, INPUT_NEURONS } from "../vectorCalculator";
import { Genome } from "./genome";
import { MOVE_ENUM } from "../GameTypes/game"

export const OUTPUT_NEURONS = 5,
             ACTION_THRESHOLD = .7;
const MOVE_ARR = [MOVE_ENUM.UP, MOVE_ENUM.DOWN, MOVE_ENUM.LEFT, MOVE_ENUM.RIGHT, MOVE_ENUM.FIRE];

export class Player {
    constructor(brain) {
        this.brain = brain != null 
                        ? brain
                        : new Genome(INPUT_NEURONS, OUTPUT_NEURONS);
        this.fitness = 0;
    }

    calculateMoves(state) {
        var vecCalc = new VectorCalculator(state);
        var vector = vecCalc.getVector();
        var results = this.brain.feedForward(vector);
        var moveObj = {};
        results.forEach((r, i) => {
            moveObj[MOVE_ARR[i]] = r;
        });
        return moveObj;
    }

    setFitness(fitness) {
        this.fitness = fitness;
    }

    haveSexWith(partner) {
        var newBrain = this.fitness > partner.fitness
                        ? this.brain.crossover(partner.brain)
                        : partner.brain.crossover(this.brain);
        return new Player(newBrain);
    }

    clone() {
        var newPlayer = new Player();
        newPlayer.brain = this.brain.clone();
        newPlayer.fitness = this.fitness;

        return newPlayer;
    }
}