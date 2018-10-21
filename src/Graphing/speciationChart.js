// code modified from http://bl.ocks.org/mdml/8305340

import * as d3 from 'd3';
import { CANVAS_WIDTH } from '../app'

const SVG_HEIGHT = 600;

export function speciationChart(data) {
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = CANVAS_WIDTH - margin.left - margin.right,
        height = SVG_HEIGHT - margin.top - margin.bottom;


    var x = d3.scale.linear().range([0, width]);

    var y = d3.scale.linear().range([height, 0]);

    var color = d3.scale.category20();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        //.tickFormat(formatPercent);

    var area = d3.svg.area()
        .x(function(d) { return x(d.generation); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    var stack = d3.layout.stack()
        .values(function(d) { return d.values; });

    var svg = d3.select("#speciation-chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data = addEmptyItems(data);

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "generation"; }));

    var browsers = stack(color.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {generation: d.generation, y: d[name] * 1};
            })
        };
    }));

    // Find the value of the day with highest total value
    var maxGeneration = data[data.length - 1].generation; 
    var popSize = Object.keys(data[0]).reduce((sum, k) => {
        if(k == 'generation') {
            return sum;
        }
        return sum + data[0][k];
    }, 0);

    // Set domains for axes
    x.domain([0, maxGeneration]);
    y.domain([0, popSize])
    var browser = svg.selectAll(".browser")
        .data(browsers)
        .enter().append("g")
        .attr("class", "browser");

    browser.append("path")
        .attr("class", "area")
        .attr("d", function(d) { 
            return area(d.values); 
        })
        .style("fill", function(d) { return color(d.name); });

    browser.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) {
            return "translate(" + x(d.value.generation) + "," + y(d.value.y0 + d.value.y / 2) + ")"; 
        })
        .attr("x", -6)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
}

function addEmptyItems(data) {
    var keys = [];
    data.forEach(d => {
        keys = keys.concat(Object.keys(d).filter(x => keys.indexOf(x) == -1));
    });

    return data.map(d => {
        keys.filter(key => Object.keys(d).indexOf(key) == -1).forEach(key => {
            d[key] = 0;
        });
        return d;
    })
}
