export class Gene {
    constructor(layer) {
        this.layer = layer;
        this.value = 0;
        this.connections = [];
    }

    addValue(val) {
        this.value += val;
    }

    addConnection(gene, weight) {
        this.connections.push({gene: gene, weight: weight});
    }

    engage() {
        var self = this;
        this.connections.forEach(connection => {
            connection.gene.addValue(self.value * connection.weight);
        });
    }

    clear() {
        this.value = 0;
        this.connections = [];
    }
}