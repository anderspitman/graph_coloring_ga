module.exports = {
  
  parseEdgeListFromText(text) {
    console.log(text);

    const lines = text.split('\n');

    const edges = [];

    for (let line of lines) {
      const edge = parseLine(line);
      edges.push(edge);
    }

    return edges;
  }

};

function parseLine(line) {

  const [ source, target ] = line.split(' ');
  return { source, target };
}
