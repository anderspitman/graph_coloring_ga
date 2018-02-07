const graphUtils = require('./graph.js');
const GA = require('./genetic_algorithm.js');
const axios = require('axios');
//const ps = require('./pubsub.js');

//axios.get('/sample_graph.g').then((response) => {
//  console.log(response);
////  main(response.data);
//});

module.exports = function(self) {

  console.log("Hi there from worker");

  self.onmessage = (message) => {
    console.log(message.data);

    if (message.data.topic === 'ga_config') {
      main(self, message.data.numGenerations, message.data.ga_text);
    }
  };
};

function main(self, numGenerations, graphText) {

  const lines = graphText.split('\n');
  const numColors = Number(lines[0]);
  const edgeList = lines.slice(1);

  const graph = graphUtils.createGraphFromLines(edgeList);

  console.log(graph);
  console.log();

  console.log(numGenerations);

  const ga = new GA.GraphColoringGA({
    numColors: numColors,
    numGenerations,
    graph: graph,
    sendMessage: self.postMessage.bind(self)
  });

  //ps.subscribe('generation_stats_updated', (message) => {
  //});

  ga.run();
}
