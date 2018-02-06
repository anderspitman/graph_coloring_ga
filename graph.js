function parseEdgeList(lines) {

  const vertices = {};
  const edges = [];

  for (let line of lines) {
    const edge = parseLine(line);
    edges.push(edge);

    if (!vertices[edge.source]) {
      vertices[edge.source] = {
        neighbors: [edge.target]
      };
    }
    else {
      vertices[edge.source].neighbors.push(edge.target);
    }

    if (!vertices[edge.target]) {
      vertices[edge.target] = {
        neighbors: [edge.source]
      };
    }
    else {
      vertices[edge.target].neighbors.push(edge.source);
    }
  }

  return [vertices, edges];
}

function createGraphFromLines(lines) {
  const [vertices, edges] = parseEdgeList(lines);

  return {
    vertices,
    edges,
    numVertices: () => {
      return Object.keys(vertices).length;
    },
  };
}

function parseLine(line) {

  const [ source, target ] = line.split(' ');
  return { source: source, target: target };
}

module.exports = {
  parseEdgeList,
  createGraphFromLines
};
