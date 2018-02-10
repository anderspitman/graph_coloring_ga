const graphUtils = require('./graph.js');
const GA = require('./genetic_algorithm.js');
const axios = require('axios');


module.exports = function(self) {

  console.log("Hi there from worker");

  self.onmessage = (message) => {
    console.log(message.data);

    if (message.data.topic === 'ga_config') {
      main(self, message.data.numGenerations,
        message.data.numColors, message.data.edgeList,
        message.data.fitnessType);
    }
  };
};

function main(self, numGenerations, numColors, edgeList, fitnessType) {

  const graph = graphUtils.createGraphFromLines(edgeList);

  console.log(graph);
  console.log(Object.keys(graph.vertices).length);
  console.log();

  console.log(numGenerations);

  const ga = new GA.GraphColoringGA({
    numColors: numColors,
    numGenerations,
    fitnessType,
    graph: graph,
    sendMessage: self.postMessage.bind(self)
  });

  //ps.subscribe('generation_stats_updated', (message) => {
  //});

  ga.run();
}
