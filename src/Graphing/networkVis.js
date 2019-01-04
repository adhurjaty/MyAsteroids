import * as d3 from 'd3';
import { CANVAS_WIDTH } from '../app'

const SVG_HEIGHT = 400,
      NODE_SIZE = 10;

export function graphNN(data, selector) {
    var width = CANVAS_WIDTH / 2,
    height = SVG_HEIGHT,
    nodeSize = NODE_SIZE;

    var color = d3.scale.category20();

    var svg = d3.select(selector)
        .attr("width", width)
        .attr("height", height);

    var nodes = data.nodes;

    // get network size
    var netsize = {};
    nodes.forEach(function (d) {
        if(d.layer in netsize) {
            netsize[d.layer] += 1;
        } else {
            netsize[d.layer] = 1;
        }
        d["lidx"] = netsize[d.layer];
    });

    // calc distances between nodes
    var largestLayerSize = Math.max.apply(
        null, Object.keys(netsize).map(function (i) { return netsize[i]; }));

    var xdist = width / Object.keys(netsize).length,
        ydist = height / largestLayerSize;

    // create node locations
    nodes.map(function(d) {
        d["x"] = (d.layer - 0.5) * xdist;
        d["y"] = (d.lidx - 0.5) * ydist;
    });

    // lookup table for layers
    var offsetLookup = Array(Object.keys(netsize).length);
    var curVal = 0;
    for(var i = 0; i < nodes.length; i++) {
        if(nodes[i].layer != curVal) {
            offsetLookup[nodes[i].layer-1] = i;
            curVal = nodes[i].layer;
        }
    }

    // autogenerate links
    var links = [];
    nodes.map(function(d, i) {
        d.connections.forEach(conn => {
            links.push({"source": i, "target": conn, "value": 1});
        });
    }).filter(function(d) { return typeof d !== "undefined"; });

    // draw links
    var link = svg.selectAll(".link")
        .data(links)
    .enter().append("line")
        .attr("class", "link")
        .attr("x1", function(d) { return nodes[d.source].x; })
        .attr("y1", function(d) { return nodes[d.source].y; })
        .attr("x2", function(d) { return nodes[d.target].x; })
        .attr("y2", function(d) { return nodes[d.target].y; })
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    // draw nodes
    var node = svg.selectAll(".node")
        .data(nodes)
    .enter().append("g")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; }
        );

    var circle = node.append("circle")
        .attr("class", "node")
        .attr("r", nodeSize)
        .style("fill", function(d) { return color(d.layer); });


    node.append("text")
        .attr("dx", "-.35em")
        .attr("dy", ".35em")
        .text(function(d) { return d.label; });
}