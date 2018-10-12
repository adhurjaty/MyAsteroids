import { VectorCalculator } from "../vectorCalculator";
import { Genome } from "./genome";
import { MOVE_ENUM } from "../GameTypes/game"

export const INPUT_NEURONS = 33,
             OUTPUT_NEURONS = 5,
             ACTION_THRESHOLD = .7;

export class Player {
    constructor() {
        this.brain = new Genome(INPUT_NEURONS, OUTPUT_NEURONS);
        this.fitness = 0;
    }

    calculateMoves(state) {
        var vecCalc = new VectorCalculator(state);
        var vector = vecCalc.getVector();
        var results = this.brain.feedForward(vector);
        debugger;
        return results.map((r, i) => {
            var obj = {};
            obj[MOVE_ENUM[i]] = r;
            return obj;
        })
    }

    setFitness(fitness) {
        this.fitness = fitness;
    }

    clone() {
        var newPlayer = new Player();
        newPlayer.brain = this.brain.clone();

        return newPlayer;
    }
}