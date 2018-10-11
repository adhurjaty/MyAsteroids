export class ConnectionGene {
    constructor(inGene, outGene, weight, innovationNumber) {
        this.inGene = inGene;
        this.outGene = outGene;
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
}