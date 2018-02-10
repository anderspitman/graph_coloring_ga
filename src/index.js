const axios = require('axios');
const work = require('webworkify');

const graphUtils = require('./graph.js');
const Charts = require('./charts.js');

axios.get('/data/sample_graph.g').then((response) => {
  main(response.data);
});

function main(graphText) {

  const numGenerations = 1000;

  const lines = graphText.split('\n');
  const numColors = Number(lines[0]);
  const edgeList = lines.slice(1);
  const fitnessType = 'standard';
  //const fitnessType = 'balanced';

  // TODO: making a duplicate graph here because apparently objects are
  // serialized when sent to workers which means callbacks throw exceptions.
  // find a cleaner way to do this
  const graph = graphUtils.createGraphFromLines(edgeList);

  const worker = work(require('./ga_worker.js'));
  worker.postMessage({
    topic: 'ga_config',
    numGenerations,
    numColors,
    fitnessType,
    edgeList,
  });

  const statsChart = new Charts.ScatterPlot({
    title: "Fitness",
    xLabel: "Generation",
    yLabel: "Fitness",
    domElementId: 'chart-stats',
    yMin: 0,
    yMax: 1,
    maxPoints: numGenerations,
    variableNames: [
      "Max Fitness", "Average Fitness", "Min Fitness", "Ratio Unique",
      "Diversity Variance", "Diversity Spread"
    ]
  });

  const multirunChart = new Charts.ScatterPlot({
    title: "Multirun",
    xLabel: "Diversity",
    yLabel: "Fitness",
    domElementId: 'chart-multirun',
    yMin: 0.85,
    yMax: 1,
    xMin: 0.65,
    xMax: 1,
    maxPoints: numGenerations,
    variableNames: [ "Fitness vs Diversity" ]
  });

  const graphChart = new Charts.Graph({
    title: "Graph Coloring for Max Fitness",
    domElementId: 'chart-graph',
    vertices: graph.vertices.slice(),
    edges: graph.edges.slice(),
  });

  const diversityPlot = new Charts.DiversityPlot({
    title: "Diversity",
    domElementId: 'chart-diversity',
    numGenerations,
  });
  
  worker.addEventListener('message', (message) => {
    //const start = performance.now();

    switch(message.data.topic) {

      case 'stats_update':

        statsChart.addPoints({
          yVals: [
            message.data.maxFitness,
            message.data.averageFitness,
            message.data.minFitness,
            message.data.uniqueSolutionDiversity,
            message.data.diversityVariance,
            message.data.diversitySpread,
          ],
        });

        multirunChart.addPoints({
          xVals: [
            message.data.uniqueSolutionDiversity,
          ],
          yVals: [
            message.data.maxFitness,
            //message.data.minFitness,
          ],
        });

        graphChart.update(
          message.data.colorIndices,
          message.data.maxIndividual);
      break;

      case 'diversity_update':
        diversityPlot.appendGeneration(
          message.data.diversity,
          message.data.fitness);
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
