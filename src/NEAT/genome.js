import { Gene } from "./gene";
import { SigmoidGene } from "./sigmoidGene";
import { ConnectionGene } from "./connectionGene";
import { randomInt } from "../util";
import { Population } from "./population";

export class Genome {
    constructor(inputs, outputs) {
        this.initGenes(inputs, outputs);
        this.initHistory();
        this.generateNetwork();
    }

    initGenes(inputs, outputs) {
        this.inputGenes = Array(inputs).fill().map((g, i) => new Gene(i));
        this.outputGenes = Array(outputs).fill().map((g, i) => new SigmoidGene(inputs + i));
        this.biasGene = new Gene(inputs + outputs);
        this.biasGene.value = 1;
        this.biasGene.id = inputs + outputs;
        this.nextGeneId = inputs + outputs + 1;
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
        this.clearAllGenes();
        this.geneHistory.filter((gh) => gh.enabled).forEach((gh) => {
            gh.inGene.addConnection(gh.outGene, gh.weight);
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

    mutate() {
        var rand = Math.random();

        if(rand < .8) {
            this.mutateWeight();
        }
        
        rand = Math.random();
        if(rand < .05) {
            this.addConnection();
        }

        rand = Math.random();
        if(rand < .03) {
            this.addNewGene();
        }
    }

    mutateWeight() {
        this.geneHistory.forEach(cg => {
            cg.mutateWeight();
        });
    }

    addConnection() {
        if(this.fullyConnected()) {
            return;
        }

        var conn = this.findValidConnection();
        if(conn != null) {
            var connGene = new ConnectionGene(conn[0], conn[1], 2 * Math.random() - 1, -1);
            Population.setInnovationNumber(connGene);
            this.geneHistory.push(connGene);
        }
    }

    fullyConnected() {
        var layers = this.getAllLayers();
        for(var i = 0; i < layers.length - 1; i++) {
            var fromLayer = layers[i];
            var remainingGenes = layers.slice(i + 1, layers.length).reduce((sum, layer) => {
                return sum + layer.length;
            }, 0);
            for(var j = 0; j < fromLayer.length; j++) {
                var fromGene = fromLayer[j];
                if(fromGene.connections.length < remainingGenes) {
                    debugger;
                    return false;
                }
            }
        }

        return true;
    }

    findValidConnection() {
        var layers = 2 + this.hiddenLayers.length;
        var tries = 0;
        while(tries < 100) {     // give up after some number of tries
            var inLayerIdx = randomInt(0, layers - 1);
            var outLayerIdx = randomInt(inLayerIdx + 1, layers);
            var inGeneIdx = randomInt(0, this.getLayer[inLayerIdx].length);
            var outGeneIdx = randomInt(0, this.getLayer[outLayerIdx].length);
            var inGene = this.getLayer(inLayerIdx)[inGeneIdx];
            var outGene = this.getLayer(outLayerIdx)[outGeneIdx];
            if(!this.isConnected(inGene, outGene)) {
                return [inGene, outGene];
            }
        }

        return null;
    }

    getLayer(idx) {
        return this.getAllLayers()[idx];
    }

    getExcessDisjointMatching(otherGenome) {
        var excess = [];
        var otherExcess = []
        var disjoint = [];
        var otherDisjoint = []
        var matching = [];

        var geneHistory = this.geneHistory;
        var otherHistory = otherGenome.geneHistory;
        var offset = 0;
        for(var i = 0; i < otherHistory.length; i++) {
            if(i + offset >= geneHistory.length) {
                otherExcess = otherHistory.slice(i);
                break;
            } else if(geneHistory[i + offset].innovationNumber > otherHistory[i].innovationNumber) {
                otherDisjoint.push(otherHistory[i]);
                offset--;
            } else if(geneHistory[i + offset].innovationNumber < otherHistory[i].innovationNumber) {
                disjoint.push(geneHistory[i + offset]);
                offset++;
                i--;
            } else if(geneHistory[i + offset].innovationNumber == otherHistory[i].innovationNumber) {
                matching.push({ original: geneHistory[i + offset], other: otherHistory[i] });
            }
        }

        excess = geneHistory.slice(otherHistory.length + offset);

        return {
            excess: excess,
            otherExcess: otherExcess,
            disjoint: disjoint,
            otherDisjoint: otherDisjoint,
            matching: matching
        };
    }

    getGeneByInnNo(innNo) {
        for(var i = 0; i < this.geneHistory.length; i++) {
            if(this.geneHistory[i].innovationNumber == innNo) {
                return this.geneHistory[i];
            }
        }

        return -1;
    }

    getAllLayers() {
        return [this.inputGenes].concat(this.hiddenLayers).concat([this.outputGenes]);
    }

    isConnected(inGene, outGene) {
        for(var i = 0; i < this.geneHistory.length; i++) {
            var cg = this.geneHistory[i];
            if(cg.inGene.id == inGene.id && cg.outGene.id == outGene.id) {
                return true;
            }
        }

        return false;
    }

    addNewGene() {
        var connGene = this.getRandomConnGene();
        connGene.disable();

        var gene = new SigmoidGene(this.nextGeneId);
        this.nextGeneId++;

        var conn1 = new ConnectionGene(connGene.inGene, gene, 1, -1);
        Population.setInnovationNumber(conn1);

        var conn2 = new ConnectionGene(gene, connGene.outGene, connGene.weight);
        Population.setInnovationNumber(conn2);

        this.geneHistory = this.geneHistory.concat([conn1, conn2]);
    }

    getRandomConnGene() {
        while(true) {
            var connGene = this.geneHistory[randomInt(0, this.geneHistory.length)];
            if(connGene.inGene.id != this.biasGene.id) {
                return connGene;
            }
        }
    }

    crossover(otherGenome) {

    }

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}