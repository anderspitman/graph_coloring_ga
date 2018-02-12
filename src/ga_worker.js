const Graph = require('./graph.js');
const GA = require('./genetic_algorithm.js');
const axios = require('axios');


module.exports = function(self) {

  self.onmessage = (message) => {
    if (message.data.topic === 'ga_config') {
      main(self, message.data);
    }
  };
};

function main(self, { numGenerations, numColors, graphObj, fitnessType }) {

  const graph = new Graph.Graph();
  graph.import({ graphObj });

  const ga = new GA.GraphColoringGA({
    numColors: numColors,
    numGenerations,
    fitnessType,
    graph: graph,
    sendMessage: self.postMessage.bind(self)
  });

  //const individual = 'aeecdedabdbbaedccdecaacbb';
  //console.log("Fitness for " + individual + ": ");
  //console.log("Num nodes: " + graph.vertices.length);
  //console.log("Num colors: " + numColors);
  //const fit = ga.fitness(individual);
  ga.run();
}
