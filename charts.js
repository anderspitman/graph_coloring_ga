const Two = require('two.js');
const d3 = require('d3-force');

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
    domElementId,
    width,
    height,
  }) {
    this.width = width;
    this.height = height;

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    this.elem = document.getElementById(domElementId);
    const params = {
      width,
      height,
      //type: Two.Types.webgl,
    };

    this.two = new Two(params).appendTo(this.elem);
  }
}


class ScatterPlot extends Chart {

  constructor({
    domElementId,
    width,
    height,
    yMax,
    maxPoints,
    color,
  }) {

    super({ domElementId, width, height });

    this.yMax = yMax;
    this.color = color;

    this.data = [];
    this.points = [];

    const background =
      this.two.makeRectangle(width / 2, height / 2, width, height);
    background.fill = '#ededed';

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
      const xPos = xRatio * this.width;
      const yRatio = this.data[i] / this.yMax;
      // y is inverted
      const yPos = this.height - (yRatio * this.height);

      point.translation.set(xPos, yPos);
    }
  }
}


class Graph extends Chart {
  constructor({
    domElementId,
    width,
    height,
    vertices,
    edges,
  }) {
    super({ domElementId, width, height });

    this.edges = edges;

    const background =
      this.two.makeRectangle(this.centerX, this.centerY, width, height);
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

class DiversityPlot {
  constructor({
    domElementId,
    width,
    height,
    numGenerations,
    maxValue,
  }) {

    this.width = width;
    this.height = height;

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    this.elem = document.getElementById(domElementId);
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.elem.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    this.ctx = ctx;

    ctx.fillStyle = '#ededed';
    ctx.fillRect(0, 0, width, height);

    //const background =
    //  this.two.makeRectangle(this.centerX, this.centerY, width, height);
    //background.fill = '#ededed';

    const numPoints = 1000;
    this.numGenerations = numGenerations;

    this.generationIndex = 0;

    //this.bars = [];
    //for (let i = 0; i < numPoints; i++) {
    //  const point = this.two.makeRectangle(0, this.centerY, 5, height);
    //  point.fill = 'tomato';
    //  point.opacity = '.1';
    //  this.bars.push(point);
    //}

    //this.two.play();
  }

  appendGeneration(maxDiversityValue, diversityData) {

    diversityData.sort();

    const ctx = this.ctx;

    //ctx.clearRect(0, 0, this.width, this.height);

    ctx.globalAlpha = 0.1;

    ctx.fillStyle = COLORS[1];

    const ySize = this.height / this.numGenerations;

    const yPos = this.generationIndex * ySize;

    for (let i = 0; i < diversityData.length; i++) {
      const xPos = diversityData[i] * this.width;
      ctx.fillRect(xPos, yPos, 10, ySize);
    }

    ctx.globalAlpha = 1.0;

    ++this.generationIndex;

    //for (let i = 0; i < diversityData.length; i++) {
    //  //const xPos = (diversityData[i] / maxDiversityValue) * this.width;
    //  const xPos = diversityData[i] * this.width;
    //  this.bars[i].translation.set(xPos, this.centerY);
    //}
  }
}

module.exports = {
  ScatterPlot,
  Graph,
  DiversityPlot,
  COLORS,
  GRAPH_COLORS,
};
