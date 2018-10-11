import { Gene } from "./gene";
import { SigmoidGene } from "./sigmoidGene";
import { ConnectionGene } from "./connectionGene";

export class Genome {
    constructor(inputs, outputs) {
        this.initGenes(inputs, outputs);
        this.initHistory();
    }

    initGenes(inputs, outputs) {
        this.inputGenes = Array(inputs).fill().map((g, i) => new Gene(i));
        this.outputGenes = Array(outputs).fill().map((g, i) => new SigmoidGene(inputs + i));
        this.biasGene = new Gene(inputs + outputs);
        this.biasGene.value = 1;
        this.hiddenLayers = [];

    }

    initHistory() {
        this.geneHistory = [];

        var innovationNumber = 0;
        var firstLayer = this.inputGenes.concat(this.biasGene);
        for(var i = 0; i < firstLayer.length; i++) {
            for(var j = 0; j < this.outputGenes.length; j++) {
                this.geneHistory.push(new ConnectionGene(firstLayer[i], this.outputGenes[j], 2 * Math.random() - 1, innovationNumber));
                innovationNumber++;
            }
        }
    }

    generateNetwork() {
        this.geneHistory.filter((gh) => gh.enabled).forEach((gh) => {
            gh.inGene.addConnection({gene: gh.outGene, weight: gh.weight});
        });
    }

    feedForward(inputs) {
        this.clearAllGeneValues();
        for(var i = 0; i < inputs.length; i++) {
            this.inputGenes[i].value = inputs[i];
            this.inputGenes[i].engage();
        }

        for(var i = 0; i < this.hiddenLayers.length; i++) {
            for(var j = 0; j < this.hiddenLayers[i].length; j++) {
                this.hiddenLayers[i][j].engage();
            }
        }

        for(var i = 0; i < this.outputGenes.length; i++) {
            this.outputGenes[i].engage();
        }

        return this.outputGenes.map((gene) => gene.value);
    }

    clearAllGenes() {
        this.getAllGenes().forEach(gene => {
            gene.clear();
        });
    }

    clearAllGeneValues() {
        this.getAllGenes().forEach(gene => {
            gene.value = 0;
        });
    }

    getAllGenes() {
        return this.inputGenes.concat(this.outputGenes).concat(...this.hiddenLayers);
    }
}