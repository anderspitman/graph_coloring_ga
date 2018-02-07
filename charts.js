const Two = require('two.js');
const d3 = require('d3-force');


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
      point.fill = this.color ? this.color : 'steelblue';
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

    sim.on('tick', () => {
      console.log("tick");
    });

    console.log(vertices);
    console.log(edges);

    this.two.update();
  }
};

module.exports = {
  ScatterPlot,
  Graph,
};
