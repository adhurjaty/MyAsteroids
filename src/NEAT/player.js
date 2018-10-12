import { VectorCalculator } from "../vectorCalculator";
import { Genome } from "./genome";
import { MOVE_ENUM } from "../GameTypes/game"

export const INPUT_NEURONS = 33,
             OUTPUT_NEURONS = 5;

export class Player {
    constructor() {
        this.brain = new Genome();
        this.fitness = 0;
    }

    calculateMoves(state) {
        var vecCalc = new VectorCalculator(state);
        var vector = vecCalc.getVector();

    }

    setFitness(fitness) {
        this.fitness = fitness;
    }
}