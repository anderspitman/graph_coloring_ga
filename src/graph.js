function parseEdgeList(lines) {

  const vertices = {};
  const vertexArray = [];
  const edges = [];

  let vertexIndex = 0;

  function addIfNew(vertexId, neighborId) {

    if (!vertices[vertexId]) {

      const vertex = {
        id: vertexId,
        index: vertexIndex,
      };

      vertices[vertexId] = vertex;
      vertexArray.push(vertex);
      vertexIndex++;
    }
  }

  for (let i = 0; i < lines.length; i++) {

    const line = lines[i];

    // skip blank lines
    if (line.length === 0) {
      continue;
    }

    const [sourceId, targetId] = line.split(' ');

    addIfNew(sourceId, targetId);
    addIfNew(targetId, sourceId);

    const edge = {
      source: vertices[sourceId].index,
      target: vertices[targetId].index,
    };

    edges.push(edge);
  }

  return [vertexArray, edges];
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
