console.log("Hi there");

const graph = require('./graph.js');

const numColors = 3;
const edgeListText = `\
1 3
0 2
2 1`;

const parsed = graph.parseEdgeListFromText(edgeListText);

console.log(parsed);
