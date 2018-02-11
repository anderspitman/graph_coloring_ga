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

  ga.run();
}
