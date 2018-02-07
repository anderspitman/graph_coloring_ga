const axios = require('axios');
const work = require('webworkify');
const Charts = require('./charts.js');

axios.get('/sample_graph.g').then((response) => {
  main(response.data);
});

function main(text) {

  const numGenerations = 200;

  const chartAvg = new Charts.ScatterPlot({
    domElementId: 'chart-avg',
    width: 500,
    height: 500,
    yMax: 1,
    maxPoints: numGenerations,
  });

  const chartMax = new Charts.ScatterPlot({
    domElementId: 'chart-max',
    width: 500,
    height: 500,
    yMax: 1,
    maxPoints: numGenerations,
    color: 'tomato',
  });

  const graphChart = new Charts.Graph({
    domElementId: 'chart-graph',
    width: 500,
    height: 500,
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

    chartAvg.update(avgFit);
    chartMax.update(maxFit);

    //const elapsed = performance.now() - start;

    //if (elapsed > max) {
    //  max = elapsed;
    //}
    //console.log("elapsed: " + elapsed);
    //console.log("max: " + max);
  });
}
