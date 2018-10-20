import { Gene } from "./gene";

export class SigmoidGene extends Gene {
    constructor(layer) {
        super(layer);
    }

    engage() {
        this.value = this.sigmoid(this.value);
        super.engage();
    }

    sigmoid(x) {
        return 1 / (1 + Math.pow(Math.E, -4.9 * x));
    }

}