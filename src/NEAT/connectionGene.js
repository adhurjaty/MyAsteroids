import { randomGaussian, boundValue } from "../util";

export class ConnectionGene {
    constructor(inGeneId, outGeneId, weight, innovationNumber) {
        this.inGeneId = inGeneId;
        this.outGeneId = outGeneId;
        this.weight = weight;
        this.innovationNumber = innovationNumber;

        this.enabled = true;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    applyWeight() {
        this.outGene.addValue(this.weight * this.inGene.value);
    }

    mutateWeight() {
        var rand = Math.random();
        if(rand < .1) {
            this.weight = 2 * Math.random() - 1;
        } else {
            this.weight += randomGaussian() / 50;
            this.weight = boundValue(this.weight, 1, -1);
        }
    }
}