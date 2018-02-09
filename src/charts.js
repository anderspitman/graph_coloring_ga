const Two = require('two.js');
const d3 = require('d3');

// colors taken from the fantastic Color Brewer: http://colorbrewer2.org
const COLORS = [
  '#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628',
  '#f781bf'
];

const GRAPH_COLORS = [
  '#1f78b4', // dark blue
  '#33a02c', // dark green
  '#e31a1c', // dark red
  '#ff7f00', // dark orange
  '#6a3d9a', // dark purple
  '#ffff99', // yellow
  '#b15928', // brown
  '#a6cee3', // light blue
  '#b2df8a', // light green
  '#fb9a99', // light red
  '#fdbf6f', // light orange
  '#cab2d6', // light purple
]

class Chart {

  constructor({
    title,
    domElementId,
  }) {

    this.elem = document.getElementById(domElementId);

    const text = d3.select(this.elem)
      .append('div')
        .attr('class', 'chart__title')
        .text(title)

    this.container = d3.select(this.elem)
      .append('div')
      .attr('class', 'chart__container')

    this.titleDim = text.node().getBoundingClientRect();

    const dim = this.elem.getBoundingClientRect();

    this.width = dim.width;
    this.height = dim.height - this.titleDim.height;

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;


  }
}


class TwoJsChart extends Chart {
  constructor({
    title,
    domElementId,
  }) {

    super({ title, domElementId });

    const params = {
      width: this.width,
      height: this.height,
      //type: Two.Types.webgl,
    };

    this.two = new Two(params).appendTo(this.container.node());
  }
}

class ScatterPlot extends TwoJsChart {

  constructor({
    title,
    domElementId,
    yMax,
    maxPoints,
    color,
  }) {

    super({ title, domElementId });

    this.yMax = yMax;
    this.color = color;

    this.margins = {
      left: 45,
      right: 30,
      top: 10,
      bottom: 45,
    };

    this.xScale = d3.scaleLinear()
      .domain([0, maxPoints])
      .range([this.margins.left, this.width - this.margins.right])

    this.yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([this.height - this.margins.bottom, this.margins.top])

    this.data = [];
    this.points = [];

    const axesContainer = this.container
      .append('svg')
        .attr('class', 'chart__axes-container')
        .attr('width', this.width)
        .attr('height', this.height)

    const xAxis = d3.axisBottom(this.xScale);
    const yAxis = d3.axisLeft(this.yScale);
    const yAxisRight = d3.axisRight(this.yScale);

    axesContainer
      .append('g')
        .attr("transform", "translate(0,"+(this.height-this.margins.bottom)+")")
        .call(xAxis)

    axesContainer
      .append('g')
        .attr("transform", "translate("+(this.margins.left)+")")
        .call(yAxis)

    axesContainer
      .append('g')
        .attr("transform", "translate("+(this.width-this.margins.right)+")")
        .call(yAxisRight)

    //const background =
    //  this.two.makeRectangle(
    //    this.margins.left + (this.adjustedWidth()/ 2),
    //    this.margins.top + (this.adjustedHeight() / 2),
    //    this.adjustedWidth(),
    //    this.adjustedHeight());

    //background.fill = '#ededed';
    //background.noStroke();

    // pre-allocate points offscreen
    for (let i = 0; i < maxPoints; i++) {
      const point =
        this.two.makeCircle(this.width + 100, this.height + 100, 2);
      point.fill = this.color ? this.color : COLORS[1];
      point.stroke = point.fill;

      this.points.push(point);
    }

    //this.two.bind('update', () => {
    //}).play();
    this.two.play();

  }

  adjustedWidth() {
    return this.width - this.margins.left - this.margins.right;
  }

  adjustedHeight() {
    return this.height - this.margins.top - this.margins.bottom;
  }

  update(data) {

    for (let i = this.data.length; i < data.length; i++ ) {
      this.data.push(data[i]);
      //const newPoint = this.two.makeCircle(0, 0, 2);
      //newPoint.fill = 'steelblue';
      //newPoint.stroke = 'steelblue';

      //this.points.push(newPoint);
    }

    this.render();
  }

  render() {

    for (let i = 0; i < this.data.length; i++) {

      const point = this.points[i];

      const xRatio = i / this.data.length;
      const xPos = this.margins.left +
        (xRatio * (this.width - this.margins.left - this.margins.right));
      const yRatio = this.data[i] / this.yMax;
      // y is inverted
      const yPos = this.height -
        (this.margins.top +
        (yRatio * (this.height - this.margins.top - this.margins.bottom)));

      point.translation.set(xPos, yPos);
    }
  }
}


class Graph extends TwoJsChart {
  constructor({
    title,
    domElementId,
    vertices,
    edges,
  }) {
    super({ title, domElementId });

    this.edges = edges;

    const background =
      this.two.makeRectangle(
        this.centerX, this.centerY, this.width, this.height);
    background.fill = '#ededed';

    const group = this.two.makeGroup();
    group.translation.set(this.centerX, this.centerY);

    this.elem.addEventListener('wheel', (e) => {

      const zoomFactor = 0.2;

      if (e.deltaY > 0) {
        group.scale -= zoomFactor * group.scale;
      }
      else {
        group.scale += zoomFactor * group.scale;
      }

      this.two.update();
    });


    const sim = d3.forceSimulation(vertices)
     .force("charge", d3.forceManyBody().strength(-100))
     .force("link", d3.forceLink(edges).distance(100))
     .force("center", d3.forceCenter());

    this.visEdges = [];
    for (let edge of edges) {
      const newEdge = this.two.makeLine(0, 0, 10, 10);
      newEdge.stroke = '#bbbbbb';
      this.visEdges.push(newEdge);
      group.add(newEdge);
    }

    this.visVertices = [];
    for (let vertex of vertices) {
      const newVertex = this.two.makeCircle(0, 0, 10);
      newVertex.fill = GRAPH_COLORS[0];
      this.visVertices.push(newVertex);
      group.add(newVertex);
    }
    
    sim.on('tick', () => {

      for (let i = 0; i < this.visEdges.length; i++) {
        const edge = this.visEdges[i];
        const [anchor1, anchor2] = edge.vertices;
        // TODO: use this method for updating:
        // https://github.com/jonobr1/two.js/issues/271
        anchor1.set(edges[i].source.x, edges[i].source.y);
        anchor2.set(edges[i].target.x, edges[i].target.y);
      }

      for (let i = 0; i < this.visVertices.length; i++) {
        const vertex = this.visVertices[i];
        vertex.translation.set(vertices[i].x, vertices[i].y);
      }

      this.two.update();
    });

    this.two.update();
  }

  updateColors(colorIndices) {

    for (let i = 0; i < this.visVertices.length; i++) {
      this.visVertices[i].fill = GRAPH_COLORS[colorIndices[i]];
    }

    for (let i = 0; i < this.visEdges.length; i++) {

      const sourceIndex = this.edges[i].source.index;
      const targetIndex = this.edges[i].target.index;

      if (this.visVertices[sourceIndex].fill ===
          this.visVertices[targetIndex].fill) {
        this.visEdges[i].stroke = 'red';
        this.visEdges[i].linewidth = 5;
      }
      else {
        this.visEdges[i].stroke = '#bbbbbb';
        this.visEdges[i].linewidth = null;
      }
    }

    this.two.update();
  }
}

class DiversityPlot extends Chart {
  constructor({
    title,
    domElementId,
    numGenerations,
    maxValue,
  }) {

    super({ title, domElementId });

    this.elem = document.getElementById(domElementId);
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.elem.appendChild(this.canvas);

    //this.scale = d3.scaleOrdinal(COLORS.slice(0, 4))
    //  .domain([0, 1]);

    const ctx = this.canvas.getContext('2d');
    this.ctx = ctx;

    ctx.strokeRect(0, 0, this.width, this.height);

    const numPoints = 1000;
    this.numGenerations = numGenerations;

    this.generationIndex = 0;
  }

  appendGeneration(diversityData, fitnessData) {

    // TODO: figure out if there's any way sorting could make canvas run
    // faster (or slower), ie from not having to move the ctx as far between
    // draws? idk probably not an issue
    //diversityData.sort();

    const ctx = this.ctx;

    //ctx.clearRect(0, 0, this.width, this.height);

    ctx.globalAlpha = 0.1;

    ctx.fillStyle = COLORS[3];

    const ySize = this.height / this.numGenerations;

    const yPos = this.generationIndex * ySize;

    for (let i = 0; i < diversityData.length; i++) {
      const xPos = diversityData[i] * this.width;
      //ctx.fillStyle = this.scale(fitnessData[i]);
      ctx.fillRect(xPos, yPos, 2, ySize);
    }

    ctx.globalAlpha = 1.0;

    ++this.generationIndex;
  }
}

module.exports = {
  ScatterPlot,
  Graph,
  DiversityPlot,
  COLORS,
  GRAPH_COLORS,
};
