const Graph = require('./graph.js');


function createGraph({ numVertices, averageDegree }) {

  // TODO: figure out why this needs to be divided by 2
  averageDegree /= 2;

  const probabilityOfEdge = averageDegree / numVertices;

  const graph = new Graph.Graph();
  
  // first ensure all vertices are added to the graph. Note that at least a
  // few will likely be disconnected.
  for (let i = 0; i < numVertices; i++) {
    //graph.addVertexIfNew({ vertexId: String(i) });
    graph.addVertexIfNew({ vertexId: "node"+i });
  }

  // create each node with given probability
  for (let i = 0; i < numVertices; i++) {
    for (let j = 0; j < numVertices; j++) {

      // don't allow self-loops
      if (i !== j) {

        if (Math.random() < probabilityOfEdge) {
          graph.addEdgeIfNew({ sourceId: 'node'+i, targetId: 'node'+j });
        }
      }
    }
  }

  console.log("Created Erdos Renyi graph");
  console.log("Num vertices: " + graph.numVertices());
  console.log("Average degree: " + graph.averageDegree());

  return graph;
}

//createGraph({ numVertices: 50, averageDegree: 5 });

module.exports = {
  createGraph,
};
