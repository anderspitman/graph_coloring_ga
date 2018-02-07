//const ps = require('./pubsub.js');

const ALPHABET =
  'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789'; 

// from: https://stackoverflow.com/a/10784675/943814
function replaceAt(s, n, t) {
    return s.substring(0, n) + t + s.substring(n + 1);
}

class GraphColoringGA {

  constructor({
    numColors,
    numGenerations,
    graph,
    sendMessage,
  }) {
    this.numColors = numColors;
    this.numGenerations = numGenerations;
    this.graph = graph;
    this.individualSize = graph.numVertices();
    this.sendMessage = sendMessage;

    this.populationSize = 100;
    this.mutationRate = 0.1;
    this.crossoverRate = 0.4;
  }

  run() {

    console.log("Running GA");

    this.population = this.randomPopulation();

    for (let i = 0; i < this.numGenerations; i++) {

      //console.log("Running generation: " + (i + 1));

      this.mutatePopulation();
      this.selectPopulation();
      
      if (this.maxFitness() === 1) {
        console.log("Optimum coloring found. Stopping");
        break;
      }
    }

    console.log("done");
  }

  mutatePopulation() {

    let numMutated = 0;
    for (let i = 0; i < this.populationSize; i++) {

      const mutate = Math.random() <= this.mutationRate;

      if (mutate) {
        numMutated++;
        this.mutateIndividual(i);
      }
    }

    //console.log("Mutation ratio: " + numMutated/this.populationSize);
    
  }

  mutateIndividual(i) {

    const mutationIndex = Math.floor(Math.random() * this.individualSize);

    const oldColor = this.population[i][mutationIndex];

    const newColorIndex = Math.floor(Math.random() * this.numColors);
    const newColor = ALPHABET[newColorIndex];

    this.population[i] =
      replaceAt(this.population[i], mutationIndex, newColor);
  }

  selectPopulation() {

    const popCopy = this.population.slice();
    popCopy.sort((a, b) => {
      const aFit = this.fitness(a);
      const bFit = this.fitness(b);

      if (aFit == bFit) {
        return 0;
      }
      else if (aFit > bFit) {
        return -1;
      }
      else {
        return 1;
      }
    });

    // TODO: currently only handles even population sizes
    const topHalf = popCopy.slice(0, this.populationSize / 2);
    //console.log(topHalf);
    this.population = topHalf.concat(topHalf);
    //this.selectedPopulation = topHalf;
  }

  maxFitness() {

    let maxFitness = 0;
    let sum = 0;
    let maxIndividual = null;
    for (let individual of this.population) {
      const fitness = this.fitness(individual)
      sum += fitness;

      //console.log(individual + ": " + fitness);
      if (fitness > maxFitness) {
        maxFitness = fitness;
        maxIndividual = individual;
      }
    }

    const averageFitness = sum / this.population.length;

    //console.log("Average fitness: " + averageFitness);
    //console.log("Max fitness: " + maxFitness);
    //console.log("Max individual: " +  maxIndividual);
    this.sendMessage({
      topic: 'stats_update',
      averageFitness,
      maxFitness,
      maxIndividual
    });

    return maxFitness;
  }

  averageFitness() {

    let sum = 0;
    for (let individual of this.population) {
      const fitness = this.fitness(individual)
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

  fitness(coloring) {

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
