const axios = require('axios');
const work = require('webworkify');

const graphUtils = require('./graph.js');
const Charts = require('./charts.js');

axios.get('/sample_graph.g').then((response) => {
  main(response.data);
});

function main(graphText) {

  const numGenerations = 200;

  const lines = graphText.split('\n');
  const numColors = Number(lines[0]);
  const edgeList = lines.slice(1);
  // TODO: making a duplicate graph here because apparently objects are
  // serialized when sent to workers which means callbacks throw exceptions.
  // find a cleaner way to do this
  const graph = graphUtils.createGraphFromLines(edgeList);

  const worker = work(require('./ga_worker.js'));
  worker.postMessage({
    topic: 'ga_config',
    numGenerations,
    numColors,
    edgeList,
  });

  const chartAvg = new Charts.ScatterPlot({
    domElementId: 'chart-avg',
    width: 300,
    height: 300,
    yMax: 1,
    maxPoints: numGenerations,
  });

  const chartMax = new Charts.ScatterPlot({
    domElementId: 'chart-max',
    width: 300,
    height: 300,
    yMax: 1,
    maxPoints: numGenerations,
    color: Charts.COLORS[0],
  });

  const graphChart = new Charts.Graph({
    domElementId: 'chart-graph',
    width: 300,
    height: 300,
    vertices: graph.vertices.slice(),
    edges: graph.edges.slice(),
  });

  const diversityPlot = new Charts.DiversityPlot({
    domElementId: 'chart-diversity',
    width: 300,
    height: 300,
    numGenerations,
  });
  
  const avgFit = [];
  const maxFit = [];

  //let max = 0;

  worker.addEventListener('message', (message) => {
    //const start = performance.now();

    switch(message.data.topic) {

      case 'stats_update':
        avgFit.push(message.data.averageFitness);
        maxFit.push(message.data.maxFitness);

        chartAvg.update(avgFit);
        chartMax.update(maxFit);

        graphChart.updateColors(message.data.colorIndices);
      break;

      case 'diversity_update':
        diversityPlot.appendGeneration(
          message.data.maxDiversityValue, message.data.diversity);
      break;
      //const elapsed = performance.now() - start;

      //if (elapsed > max) {
      //  max = elapsed;
      //}
      //console.log("elapsed: " + elapsed);
      //console.log("max: " + max);
    }
  });
}
