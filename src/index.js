const axios = require('axios');
const work = require('webworkify');

const utils = require('./utils.js');
const graphUtils = require('./graph.js');
const Charts = require('./charts.js');

axios.get('/data/sample_graph.g').then((response) => {
  runGA(response.data);
});

function runGA(graphText) {

  const numGenerations = 500;

  const lines = graphText.split('\n');
  const numColors = Number(lines[0]);
  const edgeList = lines.slice(1);
  const fitnessType = 'standard';
  //const fitnessType = 'balanced';

  // TODO: making a duplicate graph here because apparently objects are
  // serialized when sent to workers which means callbacks throw exceptions.
  // find a cleaner way to do this
  const graph = graphUtils.createGraphFromLines(edgeList);

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
    xLabel: "Ratio Unique Solutions",
    yLabel: "Fitness",
    domElementId: 'chart-multirun',
    yMin: 0.95,
    yMax: 1,
    xMin: 0.8,
    xMax: 1,
    symbolSize: 5,
    threshold: 1.0,
    maxPoints: numGenerations,
    variableNames: [ "Fitness vs Unique" ],
    legend: false,
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

  const numRuns = 1;
  const maxFitnessVals = new Float64Array(numRuns);
  const uniqueSolutionDiversityVals = new Float64Array(numRuns);
  let runIndex = 0;

  const runUniques = new Float64Array(numGenerations);
  let successCount = 0;

  doRun();
  
  //for (let runIndex = 0; runIndex < numRuns; runIndex++) {
  function doRun() {

    if (runIndex === numRuns) {
      return;
    }

    statsChart.reset();
    diversityPlot.reset();

    let runMaxFitness = 0;
    let generationIndex = 0;

    const worker = work(require('./ga_worker.js'));
    worker.postMessage({
      topic: 'ga_config',
      numGenerations,
      numColors,
      fitnessType,
      edgeList,
    });

    worker.addEventListener('message', (message) => {

      const data = message.data;

      switch(message.data.topic) {

        case 'stats_update':

          if (data.maxFitness > runMaxFitness) {
            runMaxFitness = data.maxFitness;
          }

          runUniques[generationIndex] = data.uniqueSolutionDiversity;
          ++generationIndex;

          statsChart.addPoints({
            yVals: [
              data.maxFitness,
              data.averageFitness,
              data.minFitness,
              data.uniqueSolutionDiversity,
              data.diversityVariance,
              data.diversitySpread,
            ],
          });
          
          graphChart.update(
            data.colorIndices,
            data.maxIndividual);
        break;

        case 'diversity_update':
          diversityPlot.appendGeneration(
            message.data.diversity,
            message.data.fitness);
        break;

        case 'run_completed':

          // manual mean because generationIndex is likely less that
          // numGenerations
          let sum = 0;
          for (let i = 0; i < generationIndex; i++) {
            sum += runUniques[i];
          }
          const averageUnique = sum / generationIndex;

          multirunChart.addPoints({
            xVals: [
              averageUnique
            ],
            yVals: [
              runMaxFitness
            ],
          });

          if (runMaxFitness >= 1.0) {
            ++successCount;
          }

          const runNum = runIndex + 1;
          console.log("Run " + runNum + " completed");
          console.log("Ratio successful: " + successCount / runNum);

          ++runIndex;

          doRun();
        break;
      }
    });
  }
}
