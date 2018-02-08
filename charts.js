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

    const elem = document.getElementById(domElementId);
    const params = {
      width,
      height,
      //type: Two.Types.webgl,
    };

    this.two = new Two(params).appendTo(elem);
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

    const background =
      this.two.makeRectangle(width / 2, height / 2, width, height);
    background.fill = '#ededed';


    const sim = d3.forceSimulation(vertices)
     .force("charge", d3.forceManyBody())
     .force("link", d3.forceLink(edges))
     .force("center", d3.forceCenter());

    this.visEdges = [];
    for (let edge of edges) {
      const newEdge = this.two.makeLine(0, 0, 10, 10);
      newEdge.fill = 'black';
      this.visEdges.push(newEdge);
    }

    this.visVertices = [];
    for (let vertex of vertices) {
      const newVertex = this.two.makeCircle(0, 0, 10);
      newVertex.fill = GRAPH_COLORS[0];
      this.visVertices.push(newVertex);
    }

    sim.on('tick', () => {

      for (let i = 0; i < this.visEdges.length; i++) {
        const edge = this.visEdges[i];
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const [anchor1, anchor2] = edge.vertices;
        anchor1.set(centerX + edges[i].source.x, centerY + edges[i].source.y);
        anchor2.set(centerX + edges[i].target.x, centerY + edges[i].target.y);
      }

      for (let i = 0; i < this.visVertices.length; i++) {
        const vertex = this.visVertices[i];
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        vertex.translation.set(
          centerX + vertices[i].x, centerY + vertices[i].y);
      }

      this.two.update();
    });

    this.two.update();
  }

  updateColors(colorIndices) {

    for (let i = 0; i < this.visVertices.length; i++) {
      this.visVertices[i].fill = GRAPH_COLORS[colorIndices[i]];
    }

    this.two.update();
  }
};

module.exports = {
  ScatterPlot,
  Graph,
  COLORS,
  GRAPH_COLORS,
};
