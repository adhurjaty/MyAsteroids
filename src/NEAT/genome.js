import { Gene } from "./gene";
import { SigmoidGene } from "./sigmoidGene";
import { ConnectionGene } from "./connectionGene";
import { randomInt, cloneObject } from "../util";
import { Population } from "./population";

export class Genome {
    constructor(inputs, outputs) {
        this.initGenes(inputs, outputs);
        this.initHistory();
        this.generateNetwork();

        this.lastCreatedGene = null;
        this.cloneOf = null;
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
                this.geneHistory.push(new ConnectionGene(firstLayer[i].id, this.outputGenes[j].id, 2 * Math.random() - 1, innovationNumber));
                innovationNumber++;
            }
        }
    }

    generateNetwork() {
        var self = this;
        this.clearAllGenes();
        this.geneHistory.filter((gh) => gh.enabled).forEach((gh) => {
            var inGene = self.getGeneById(gh.inGeneId);
            var outGene = self.getGeneById(gh.outGeneId);
            if(outGene == null) {
                debugger;
            }
            inGene.addConnection(outGene, gh.weight);
        });
        this.setHiddenLayers();
    }

    setHiddenLayers() {
        var inputLayer = this.getLayer(0);
        this.hiddenLayers = [];
        for(var i = 0; i < inputLayer.length; i++) {
            var connections = inputLayer[i].connections;
            for(var j = 0; j < connections.length; j++) {
                this.assignGeneToHidden(connections[j].gene)
            }
        }
    }

    assignGeneToHidden(gene, layerIdx) {
        if(gene.connections.length == 0) {
            return;
        }
        layerIdx = layerIdx | 0;
        if(layerIdx > 4) {
            debugger;
        }
        if(this.hiddenLayers.length <= layerIdx) {
            this.hiddenLayers.push([gene]);
        } else {
            this.hiddenLayers[layerIdx].push(gene);
        }
        for(var i = 0; i < gene.connections.length; i++) {
            this.assignGeneToHidden(gene.connections[i].gene, layerIdx + 1);
        }
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
        var self = this;
        this.getAllGenes().filter(g => g.id != self.biasGene.id).forEach(gene => {
            gene.clear();
        });
    }

    clearAllGeneValues() {
        var self = this;
        this.getAllGenes().filter(g => g.id != self.biasGene.id).forEach(gene => {
            gene.value = 0;
        });
    }

    getAllGenes() {
        return this.getAllLayers().flat();
    }

    mutate() {
        var rand = Math.random();
        var conn = false;
        var add = false;

        if(rand < .8) {
            this.mutateWeight();
        }
        
        rand = Math.random();
        if(rand < .05) {
            this.addConnection();
            conn = true;
        }

        rand = Math.random();
        if(rand < .03) {
            this.addNewGene();
            add = true;
        }

        var lastGH = this.geneHistory[this.geneHistory.length - 1];
        if(this.getGeneById(lastGH.inGeneId) == null || this.getGeneById(lastGH.outGeneId) == null) {
            debugger;
        }

        this.generateNetwork();
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
            var connGene = new ConnectionGene(conn[0].id, conn[1].id, 2 * Math.random() - 1, -1);
            Population.setInnovationNumber(connGene);
            if(connGene.inGeneId == connGene.outGeneId) {
                debugger;
            }
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
                    return false;
                }
            }
        }

        return true;
    }

    findValidConnection() {
        var layers = this.getAllLayers();
        var tries = 0;
        while(tries < 100) {     // give up after some number of tries
            var inLayerIdx = randomInt(0, layers.length - 1);
            var outLayerIdx = randomInt(inLayerIdx + 1, layers.length);
            var inGeneIdx = randomInt(0, layers[inLayerIdx].length);
            var outGeneIdx = randomInt(0, layers[outLayerIdx].length);
            var inGene = layers[inLayerIdx][inGeneIdx];
            var outGene = layers[outLayerIdx][outGeneIdx];
            if(!this.isConnected(inGene, outGene)) {
                if(inGene.id == outGene.id) {
                    debugger;
                }
                return [inGene, outGene];
            }
            tries++;
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

    getGeneById(id) {
        return this.getAllGenes().find(g => g.id == id);
    }

    createNewGene() {
        var gene = new SigmoidGene(this.nextGeneId);
        this.nextGeneId++;
        this.lastCreatedGene = gene;

        return gene;
    }

    getAllLayers() {
        return [this.inputGenes.concat([this.biasGene])]
                .concat(this.hiddenLayers)
                .concat([this.outputGenes]);
    }

    isConnected(inGene, outGene) {
        for(var i = 0; i < this.geneHistory.length; i++) {
            var cg = this.geneHistory[i];
            if(cg.inGeneId == inGene.id && cg.outGeneId == outGene.id) {
                return true;
            }
        }

        return false;
    }

    addNewGene() {
        var connGene = this.getRandomConnGene();
        connGene.disable();

        if(this.getGeneById(this.nextGeneId) != null) {
            debugger;
        }

        var gene = this.createNewGene();

        var conn1 = new ConnectionGene(connGene.inGeneId, gene.id, 1, -1);
        Population.setInnovationNumber(conn1);

        var conn2 = new ConnectionGene(gene.id, connGene.outGeneId, connGene.weight, -1);
        Population.setInnovationNumber(conn2);

        this.geneHistory = this.geneHistory.concat([conn1, conn2]);

        // add it to a new hidden layer. It will be put in the correct location after generateNetowrk
        this.hiddenLayers.push([gene]);
    }

    getRandomConnGene() {
        while(true) {
            var connGene = this.geneHistory[randomInt(0, this.geneHistory.length)];
            if(connGene.inGeneId != this.biasGene.id) {
                return connGene;
            }
        }
    }

    crossover(otherGenome) {
        var edm = this.getExcessDisjointMatching(otherGenome);
        var newGeneHistory = edm.matching.map((m) => {
            if(Math.random() < .5) {
                return m.original;
            }
            return m.other;
        });

        newGeneHistory = newGeneHistory.concat(edm.disjoint)
                                       .concat(edm.otherDisjoint)
                                       .concat(edm.excess)
                                       .concat(edm.otherExcess);
        newGeneHistory.sort((a, b) => a.innovationNumber - b.innovationNumber);
        var newGenome = this.clone();
        newGenome.geneHistory = newGeneHistory;
        return newGenome;
    }

    clone() {
        var c = cloneObject(this);
        c.geneHistory = this.geneHistory.map(g => cloneObject(g));
        c.inputGenes = this.inputGenes.map(g => cloneObject(g));
        for(var i = 0; i < this.hiddenLayers.length; i++) {
            c.hiddenLayers[i] = this.hiddenLayers[i].map(g => cloneObject(g));
        }
        c.outputGenes = this.outputGenes.map(g => cloneObject(g));
        c.biasGene = cloneObject(this.biasGene);
        c.cloneOf = this;
        return c;
    }

    toJson() {
        var jsonObj = {nodes: []};
        var layers = this.getAllLayers();
        for(var i = 0; i < layers.length; i++) {
            for(var j = 0; j < layers[i].length; j++) {
                var connections = this.connectionsToLayerIdx(layers[i][j].connections, layers[i+1]);
                jsonObj.nodes.push({
                    layer: i + 1,
                    label: layers[i][j].id,
                    connections: connections
                });
            }
        }
        debugger;
        return jsonObj;
    }

    connectionsToLayerIdx(connections, layer) {
        return connections.map((connGene) => {
            for(var i = 0; i < layer.length; i++) {
                if(connGene.gene.id == layer[i].id) {
                    return i;
                }
            }
        });
    }
}