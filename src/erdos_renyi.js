const Graph = require('./graph.js');


function createGraph({ numVertices, averageDegree }) {

  // TODO: figure out why this needs to be divided by 2
  averageDegree /= 2;

  const probabilityOfEdge = averageDegree / numVertices;
  console.log(probabilityOfEdge);

  const graph = new Graph.Graph();
  
  // create each node with given probability
  for (let i = 0; i < numVertices; i++) {
    for (let j = 0; j < numVertices; j++) {

      if (Math.random() < probabilityOfEdge) {
        graph.addEdgeIfNew({ sourceId: i, targetId: j });
      }
    }
  }

  console.log(graph.numVertices());
  console.log(graph.averageDegree());
}

createGraph({ numVertices: 1000, averageDegree: 2 });
