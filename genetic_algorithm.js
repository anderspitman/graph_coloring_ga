const ALPHABET =
  'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789'; 

class GraphColoringGA {

  constructor({
    numColors,
    graph,
  }) {
    this.numColors = numColors;
    this.graph = graph;
    this.individualSize = graph.numVertices();

    this.populationSize = 100;
    this.numGenerations = 100;
    this.mutationRate = 0.1;
    this.crossoverRate = 0.4;
  }

  run() {

    this.population = this.randomPopulation();

    console.log(this.population);
    console.log("Max fitness: " + this.maxFitness());
    console.log("Average fitness: " + this.averageFitness());

    for (let i = 0; i < this.numGenerations; i++) {
    }
  }

  maxFitness() {

    let max = 0;
    for (let individual of this.population) {
      const fitness = this.fitnessForColoring(individual)

      console.log(individual + ": " + fitness);
      if (fitness > max) {
        max = fitness;
      }
    }

    return max;
  }

  averageFitness() {

    let sum = 0;
    for (let individual of this.population) {
      const fitness = this.fitnessForColoring(individual)
      sum += fitness;
    }

    return sum / this.population.length;
  }

  randomPopulation() {

    let population = [];

    for (let i = 0; i < this.populationSize; i++) {
      const individual = this.randomIndividual();
      population.push(individual);
    }

    return population;
  }

  randomIndividual() {

    let str = '';
    for (let i = 0; i < this.individualSize; i++) {
      str = str.concat(this.randomColor());
    }

    return str;
  }

  randomColor() {
    const randomIndex = Math.floor(Math.random() * this.numColors);
    return ALPHABET[randomIndex];
  }

  fitnessForColoring(coloring) {

    const edges = this.graph.edges;

    let sum = 0;
    for (let edge of edges) {

      if (coloring[edge.source] !== coloring[edge.target]) {
        ++sum;
      }
    }

    return sum/edges.length;
  }
}

module.exports = {
  GraphColoringGA,
  ALPHABET: ALPHABET
};
