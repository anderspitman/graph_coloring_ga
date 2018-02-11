const axios = require('axios');
const work = require('webworkify');
const d3 = require('d3');

const utils = require('./utils.js');
const Graph = require('./graph.js');
const Charts = require('./charts.js');
const ER = require('./erdos_renyi.js');

axios.get('/data/sample_graph.g').then((response) => {
  runGA(response.data);
});

function runGA(graphText) {

  const numGenerations = 200;

  const lines = graphText.split('\n');
  //const numColors = Number(lines[0]);
  const numColors = 3;
  const edgeListLines = lines.slice(1);
  const fitnessType = 'standard';
  //const fitnessType = 'balanced';

  const multirunChart = new Charts.ScatterPlot({
    title: "Neutrality vs Degree",
    domElementId: 'chart-multirun',
    xLabel: "Average Degree",
    yLabel: "Neutrality",
    xMin: 0,
    xMax: 6,
    yMin: 0,
    yMax: 1,
    symbolSize: 3,
    maxPoints: numGenerations,
    variableNames: [ "Neutrality vs Degree" ],
  });

  const numRuns = 10;
  let runIndex = 0;

  const maxFitnessVals = new Float64Array(numGenerations);

  const runUniques = new Float64Array(numGenerations);
  let successCount = 0;

  const lowestTargetDegree = 1;
  const highestTargetDegree = 5;
  const degreeScale = d3.scaleLinear()
    .domain([0, numRuns])
    .range([lowestTargetDegree, highestTargetDegree])

  doRun();
  
  //for (let runIndex = 0; runIndex < numRuns; runIndex++) {
  function doRun() {

    if (runIndex === numRuns) {
      return;
    }

    const targetDegree = degreeScale(runIndex);

    console.log("targetDegree: " + targetDegree);

    const erGraph = ER.createGraph({
      numVertices: 50,
      averageDegree: targetDegree,
    });

    //const graph = Graph.createGraphFromLines(edgeListLines);
    const graph = erGraph;
    const graphObj = graph.export();

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

    const graphChart = new Charts.Graph({
      title: "Graph Coloring for Max Fitness",
      domElementId: 'chart-graph',
      vertices: utils.deepCopy(graph.vertices),
      edges: utils.deepCopy(graph.edges),
    });

    const diversityPlot = new Charts.DiversityPlot({
      title: "Diversity",
      domElementId: 'chart-diversity',
      numGenerations,
    });

    statsChart.reset();
    diversityPlot.reset();

    let runMaxFitness = 0;
    let generationIndex = 0;
    let lastNeutrality = 0;

    const worker = work(require('./ga_worker.js'));
    worker.postMessage({
      topic: 'ga_config',
      numGenerations,
      numColors,
      fitnessType,
      // Note: have to send edgelist because apparently class instances can't
      // traverse the web worker barrier
      graphObj, 
    });

    worker.addEventListener('message', (message) => {

      const data = message.data;

      switch(message.data.topic) {

        case 'stats_update':

          if (data.maxFitness > runMaxFitness) {
            runMaxFitness = data.maxFitness;
          }

          maxFitnessVals[generationIndex] = data.maxFitness;
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

        case 'neutrality_update':

          console.log("neutrality received: " + message.data.neutrality);
          lastNeutrality = message.data.neutrality;

        break;

        case 'run_completed':

          // manual mean because generationIndex is likely less that
          // numGenerations
          let sum = 0;
          for (let i = 0; i < generationIndex; i++) {
            sum += runUniques[i];
          }
          const averageUnique = sum / generationIndex;

          const averageMaxFitness = utils.mean(maxFitnessVals);

          if (runMaxFitness >= 1.0) {

            ++successCount;

            console.log("lastNeutrality: " + lastNeutrality);
            multirunChart.addPoints({
              xVals: [
                graph.averageDegree(),
              ],
              yVals: [
                lastNeutrality
              ],
            });

            // only continue to the next run after we find a valid coloring
            ++runIndex;
          }

          const runNum = runIndex + 1;
          console.log("Run " + runNum + " completed");
          console.log("Ratio successful: " + successCount / runNum);

          //++runIndex;

          doRun();
        break;
      }
    });
  }
}
