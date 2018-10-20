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
        this.inputs = inputs;
        this.outputs = outputs;
        var inputGenes = Array(inputs).fill().map((g, i) => new Gene(0));
        var outputGenes = Array(outputs).fill().map((g, i) => new SigmoidGene(1));
        var biasGene = new Gene(0);
        biasGene.value = 1;
        this.genes = inputGenes.concat([biasGene]).concat(outputGenes);
    }

    initHistory() {
        this.geneHistory = [];

        var innovationNumber = 0;
        var firstLayer = this.getLayer(0);
        var outputLayer = this.getOutputLayer();
        for(var i = 0; i < firstLayer.length; i++) {
            for(var j = 0; j < outputLayer.length; j++) {
                this.geneHistory.push(new ConnectionGene(i, firstLayer.length + j, 2 * Math.random() - 1, innovationNumber));
                innovationNumber++;
            }
        }
    }

    generateNetwork() {
        var self = this;
        this.clearAllGenes();
        this.geneHistory.filter((gh) => gh.enabled).forEach((gh) => {
            var inGene = self.genes[gh.inGeneId];
            var outGene = self.genes[gh.outGeneId];
            inGene.addConnection(outGene, gh.weight);
        });
        this.setGeneLayers();
    }

    setGeneLayers() {
        var inputLayer = this.getLayer(0);
        for(var i = 0; i < inputLayer.length; i++) {
            var connections = inputLayer[i].connections;
            for(var j = 0; j < connections.length; j++) {
                this.assignGeneLayer(connections[j].gene)
            }
        }
        this.setOutputLayer();
    }

    assignGeneLayer(gene, layerIdx) {
        layerIdx = layerIdx | 0;
        gene.layer = Math.max(gene.layer, layerIdx + 1);
        if(gene.connections.length == 0) {
            return;
        }

        for(var i = 0; i < gene.connections.length; i++) {
            this.assignGeneLayer(gene.connections[i].gene, gene.layer);
        }
    }

    setOutputLayer() {
        var outLayer = Math.max(...this.getOutputLayer().map(g => g.layer));
        this.getOutputLayer().forEach(g => {
            g.layer = outLayer;
        })
    };

    feedForward(inputs) {
        this.clearAllGeneValues();
        var inputLayer = this.getInputLayer();
        for(var i = 0; i < inputs.length; i++) {
            inputLayer[i].value = inputs[i];
        }

        var layers = this.getAllLayers();
        for(var i = 0; i < layers.length; i++) {
            for(var j = 0; j < layers[i].length; j++) {
                layers[i][j].engage();
            }
        }

        return layers[layers.length - 1].map((gene) => gene.value);
    }

    clearAllGenes() {
        this.genes.forEach(gene => {
            gene.clear();
        });
    }

    clearAllGeneValues() {
        this.getAllGenesNoBias().forEach(gene => {
            gene.value = 0;
        });
    }

    getAllGenesNoBias() {
        return this.genes.slice(0, this.inputs).concat(this.genes.slice(this.inputs + 1));
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
            var inGeneId = this.genes.indexOf(inGene);
            var outGeneId = this.genes.indexOf(outGene);
            if(!this.isConnected(inGeneId, outGeneId)) {
                return [inGeneId, outGeneId];
            }
            tries++;
        }

        return null;
    }

    isConnected(inGeneId, outGeneId) {
        for(var i = 0; i < this.geneHistory.length; i++) {
            var cg = this.geneHistory[i];
            if(cg.inGeneId == inGeneId && cg.outGeneId == outGeneId) {
                return true;
            }
        }

        return false;
    }

    addNewGene() {
        var connGene = this.getRandomConnGene();
        connGene.disable();

        var gene = new SigmoidGene(1);  // put it in random layer, will be corrected in setLayers

        var conn1 = new ConnectionGene(connGene.inGeneId, this.genes.length, 1, -1);
        Population.setInnovationNumber(conn1);

        var conn2 = new ConnectionGene(this.genes.length, connGene.outGeneId, connGene.weight, -1);
        Population.setInnovationNumber(conn2);

        this.geneHistory = this.geneHistory.concat([conn1, conn2]);

        this.genes.push(gene);
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
        return this.geneHistory.find(g => g.innovationNumber == innNo);
    }

    getAllLayers() {
        return this.genes.reduce((lst, g) => {
            var initLen = lst.length;
            for(var i = 0; i < g.layer - initLen + 1; i++) {
                lst.push([]);
            }
            lst[g.layer].push(g);
            return lst;
        }, []);
    }

    getInputLayer() {
        return this.genes.slice(0, this.inputs);
    }

    getOutputLayer() {
        return this.genes.slice(this.inputs + 1, this.inputs + 1 + this.outputs);
    }

    getLayer(idx) {
        return this.getAllLayers()[idx];
    }

    getRandomConnGene() {
        while(true) {
            var connGene = this.geneHistory[randomInt(0, this.geneHistory.length)];
            if(connGene.inGeneId != this.inputs + 1) {
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
        newGenome.geneHistory = newGeneHistory.map(g => cloneObject(g));
        return newGenome;
    }

    clone() {
        var c = cloneObject(this);
        c.geneHistory = this.geneHistory.map(g => cloneObject(g));
        c.genes = this.genes.map(g => cloneObject(g));
        c.cloneOf = this;
        return c;
    }

    toJson() {
        var jsonObj = {nodes: []};
        var layers = this.getAllLayers();
        for(var i = 0; i < layers.length; i++) {
            for(var j = 0; j < layers[i].length; j++) {
                var connections = this.connectionsToLayerIdx(layers[i][j].connections, i+1);
                var label = this.genes.indexOf(layers[i][j]);
                jsonObj.nodes.push({
                    layer: i + 1,
                    label: label,
                    connections: connections
                });
            }
        }
        return jsonObj;
    }

    connectionsToLayerIdx(connections, layerIdx) {
        var layers = this.getAllLayers();
        return connections.map((connGene) => {
            for(var i = layerIdx; i < layers.length; i++) {
                for(var j = 0; j < layers[i].length; j++) {
                    var connGeneId = this.genes.indexOf(connGene.gene);
                    var geneId = this.genes.indexOf(layers[i][j]);
                    if(connGeneId == geneId) {
                        return i;
                    }
                }
            }
        });
    }
}