const assert = require('assert');

function closeEnough(a, b) {
  return Math.abs(a - b) < 0.00001
}

describe('Graph', () => {

  const graphUtils = require('../graph.js');

  const edgeList = [
    '1 3',
    '0 2',
    '2 1',
  ];

  const graph = graphUtils.createGraphFromLines(edgeList);

  describe('#edges', () => {

    it('length should be 3', () => {
      assert.equal(graph.edges.length, 3);
    });

    it ("should have correct edges", () => {

      assert.equal(graph.edges[0].source, 0);
      assert.equal(graph.edges[0].target, 1);
      assert.equal(graph.edges[1].source, 2);
      assert.equal(graph.edges[1].target, 3);
      assert.equal(graph.edges[2].source, 3);
      assert.equal(graph.edges[2].target, 0);
    });
  });

});

describe('GA', () => {

  const GA = require('../genetic_algorithm.js');
  const graphUtils = require('../graph.js');

  const edgeList = [
    '1 3',
    '0 2',
    '2 1',
  ];
  const graph = graphUtils.createGraphFromLines(edgeList);

  const ga = new GA.GraphColoringGA({
    numColors: 3,
    graph: graph,
  });

  describe('#fitness', () => {

    it ("should exist", () => {
      assert(ga.fitness);
    });

    it ("works", () => {
      assert.equal(ga.fitness('abcd'), 1);
      assert(closeEnough(ga.fitness('abca'),
        0.66666));
      assert(closeEnough(ga.fitness('aaca'),
        0.33333));
      assert(closeEnough(ga.fitness('aaab'),
        0.66666));
      assert(closeEnough(ga.fitness('aaaa'), 0));
    });
  });
});
