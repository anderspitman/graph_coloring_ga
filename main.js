const axios = require('axios');
const work = require('webworkify');
const Two = require('two.js');

axios.get('/sample_graph.g').then((response) => {
  main(response.data);
});

class ScatterPlot {

  constructor({
    domElementId,
    width,
    height,
    yMax,
    maxPoints,
    color,
  }) {

    this.yMax = yMax;
    this.width = width;
    this.height = height;
    this.color = color;

    this.data = [];
    this.points = [];

    // Make an instance of two and place it on the page.
    const elem = document.getElementById(domElementId);
    const params = {
      width,
      height,
      //type: Two.Types.webgl,
    };

    this.two = new Two(params).appendTo(elem);

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

function main(text) {

  const numGenerations = 200;

  const plotAvg = new ScatterPlot({
    domElementId: 'plot-avg',
    width: 640,
    height: 480,
    yMax: 1,
    maxPoints: numGenerations,
  });

  const plotMax = new ScatterPlot({
    domElementId: 'plot-max',
    width: 640,
    height: 480,
    yMax: 1,
    maxPoints: numGenerations,
    color: 'tomato',
  });

  const worker = work(require('./ga_worker.js'));

  worker.postMessage({
    topic: 'ga_config',
    numGenerations,
    ga_text: text,
  });

  const avgFit = [];
  const maxFit = [];

  //let max = 0;

  worker.addEventListener('message', (message) => {
    //const start = performance.now();

    avgFit.push(message.data.averageFitness);
    maxFit.push(message.data.maxFitness);

    plotAvg.update(avgFit);
    plotMax.update(maxFit);

    //const elapsed = performance.now() - start;

    //if (elapsed > max) {
    //  max = elapsed;
    //}
    //console.log("elapsed: " + elapsed);
    //console.log("max: " + max);
  });
}
