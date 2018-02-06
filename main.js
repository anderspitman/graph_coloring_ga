const graphUtils = require('./graph.js');
const GA = require('./genetic_algorithm.js');

fetch('sample_graph.g').then((response) => {

  return response.text().then((text) => {
    main(text);
  })
});

function main(graphText) {

  const lines = graphText.split('\n');
  const numColors = Number(lines[0]);
  const edgeList = lines.slice(1);

  const graph = graphUtils.createGraphFromLines(edgeList);

  console.log(graph);
  console.log();

  const ga = new GA.GraphColoringGA({
    numColors: numColors,
    graph: graph,
  });

  ga.run();
}
