

class Graph {
  constructor() {
    this.verticesObj = {};
    this.vertices = []
    this.edges = [];
    this.vertexIndex = 0;
  }

  numVertices() {
    return Object.keys(this.verticesObj).length;
  }

  averageDegree() {

    let sum = 0;
    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      sum += this.degree({ vertexId: vertex.id });
    }

    return sum / this.vertices.length;
  }

  degree({ vertexId }) {
    return Object.keys(this.verticesObj[vertexId].neighbors).length;
  }

  readEdgesFromLines(lines) {

    for (let i = 0; i < lines.length; i++) {

      const line = lines[i];

      // skip blank lines
      if (line.length === 0) {
        continue;
      }

      const [sourceId, targetId] = line.split(' ');

      this.addEdgeIfNew({ sourceId, targetId });
    }
  }

  addVertexIfNew({ vertexId }) {

    if (this.verticesObj[vertexId] === undefined) {

      const vertex = {
        id: vertexId,
        index: this.vertexIndex,
        neighbors: {},
      };

      this.verticesObj[vertexId] = vertex;
      this.vertices.push(vertex);
      this.vertexIndex++;
    }
  }

  addEdgeIfNew({ sourceId, targetId }) {

    this.addVertexIfNew({ vertexId: sourceId });
    this.addVertexIfNew({ vertexId: targetId });

    if (this.verticesObj[sourceId].neighbors[targetId] === undefined &&
        this.verticesObj[targetId].neighbors[sourceId] === undefined) {

      this.verticesObj[sourceId].neighbors[targetId] = 1;
      this.verticesObj[targetId].neighbors[sourceId] = 1;

      const edge = {
        source: this.verticesObj[sourceId].index,
        target: this.verticesObj[targetId].index,
      };

      this.edges.push(edge);
    }
  }

  export() {

    const obj = {
      vertices: [],
      edges: [],
    };

    for (let vertex of this.vertices) {
      obj.vertices.push({
        id: vertex.id
      });
    }

    for (let edge of this.edges) {
      obj.edges.push({
        sourceId: this.vertices[edge.source].id,
        targetId: this.vertices[edge.target].id,
      });
    }

    return obj;
  }

  import({ graphObj }) {

    const graph = new Graph();

    for (let vertex of graphObj.vertices) {
      this.addVertexIfNew({ vertexId: vertex.id });
    }

    for (let edge of graphObj.edges) {
      this.addEdgeIfNew({ sourceId: edge.sourceId, targetId: edge.targetId });
    }
  }
}

function createGraphFromLines(lines) {

  const graph = new Graph();
  graph.readEdgesFromLines(lines);

  return graph;
}


module.exports = {
  Graph,
  createGraphFromLines
};
