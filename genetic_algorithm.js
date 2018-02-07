//const ps = require('./pubsub.js');

const ALPHABET =
  'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789'; 

// from: https://stackoverflow.com/a/10784675/943814
function replaceAt(s, n, t) {
    return s.substring(0, n) + t + s.substring(n + 1);
}

// from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomElement(array) {
  return array[getRandomInt(0, array.length)];
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

    this.populationSize = 1000;
    this.mutationRate = 0.5;
    this.crossoverRate = 0.7;
    // probability that more fit individual will be selected to be a parent
    this.selectionBias = 0.8;
  }

  run() {

    console.log("Running GA");

    this.population = this.randomPopulation();

    for (let i = 0; i < this.numGenerations; i++) {

      this.doGeneration(i);
      
      if (this.maxFitness() === 1) {
        console.log("Optimum coloring found. Stopping");
        break;
      }
    }

    console.log("done");
  }

  doGeneration(index) {

    const newPopulation = [];

    while (newPopulation.length < this.population.length) {

      const parent1 = this.tournamentSelectIndividual();
      const parent2 = this.tournamentSelectIndividual();

      let [offspring1, offspring2] = this.crossover(parent1, parent2);

      offspring1 = this.mutate(offspring1);
      offspring2 = this.mutate(offspring2);

      newPopulation.push(offspring1);
      newPopulation.push(offspring2);
    }

    if (newPopulation.length > this.population.length) {
      newPopulation = slice(0, newPopulation.length - 1);
    }

    this.population = newPopulation;
  }

  tournamentSelectIndividual() {

    const ind1 = this.getRandomIndividual();
    const ind2 = this.getRandomIndividual();

    const fit1 = this.fitness(ind1);
    const fit2 = this.fitness(ind2);

    const selectMoreFit = Math.random() <= this.selectionBias;

    let selected;
    if (selectMoreFit) {
      selected = fit1 > fit2 ? ind1 : ind2;
    }
    else {
      selected = fit1 > fit2 ? ind2 : ind1;
    }

    return selected;
  }

  getRandomIndividual() {
    return getRandomElement(this.population);
  }

  crossover(parent1, parent2) {

    const crossover = Math.random() <= this.crossoverRate;

    let offspring1 = parent1;
    let offspring2 = parent2;

    if (crossover) {

      const index1 = getRandomInt(0, this.individualSize);
      const index2 = getRandomInt(0, this.individualSize);

      const lower = index1 < index2 ? index1 : index2;
      const higher = index1 > index2 ? index1 : index2;

      const p1Lower = parent1.slice(0, lower);
      const p1Crossover = parent2.slice(lower, higher);
      const p1Higher = parent1.slice(higher);
      offspring1 = p1Lower
        .concat(p1Crossover)
        .concat(p1Higher);

      const p2Lower = parent2.slice(0, lower);
      const p2Crossover = parent1.slice(lower, higher);
      const p2Higher = parent2.slice(higher);
      offspring2 = p2Lower
        .concat(p2Crossover)
        .concat(p2Higher);
    }

    return [offspring1, offspring2];
  }

  mutate(individual) {

    let mutated = individual;

    const mutate = Math.random() <= this.mutationRate;

    if (mutate) {

      const mutationIndex = getRandomInt(0, this.individualSize);
      const oldColor = getRandomElement(individual);
      const newColorIndex = getRandomInt(0, this.numColors);
      const newColor = ALPHABET[newColorIndex];
      mutated = replaceAt(individual, mutationIndex, newColor);

      //console.log(mutationIndex, individual, mutated);
    }

    return mutated;
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
    console.log("Max fitness: " + maxFitness);
    //console.log("Max individual: " +  maxIndividual);
    this.sendMessage({
      topic: 'stats_update',
      averageFitness,
      maxFitness,
      maxIndividual
    });

    return maxFitness;
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
