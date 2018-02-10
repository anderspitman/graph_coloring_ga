//const ps = require('./pubsub.js');

const ALPHABET =
  'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789'; 

const COLOR_INDEX_MAP = [];

for (let i = 0; i < ALPHABET.length; i++) {
  COLOR_INDEX_MAP[ALPHABET[i]] = i;
}

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

// math utils taken from: https://gist.github.com/Daniel-Hug/7273430
function sum(array) {
  var num = 0;
  for (var i = 0, l = array.length; i < l; i++) {
    num += array[i];
  }
  return num;
}
function calculateMean(array) {
  return sum(array) / array.length;
}
function calculateVariance(array) {
  const mean = calculateMean(array);
  return calculateMean(array.map(function(num) {
    return Math.pow(num - mean, 2);
  }));
}

class GraphColoringGA {

  constructor({
    numColors,
    numGenerations,
    fitnessType,
    graph,
    sendMessage,
  }) {
    this.numColors = numColors;
    this.numGenerations = numGenerations;
    this.graph = graph;
    this.individualSize = graph.numVertices();
    this.sendMessage = sendMessage;

    this.fitnessType = fitnessType;
    this.populationSize = 1000;
    this.mutationRate = 0.01;
    this.crossoverRate = 0.7;
    // probability that more fit individual will be selected to be a parent
    this.selectionBias = 0.90;

    this.diversity = new Float64Array(this.populationSize);
    this.diversitySpread = new Float64Array(this.populationSize);
    this.populationFitness = new Float32Array(this.populationSize);

    this.maxDiversityValue = 0;
    // larger strings can easily require ginormous numbers to encode. This
    // variable limits it to only the max "n bits". Basically accomplishes
    // a sort of binning, since we can't have an infinite number of bins,
    // eventually we have to throw everything close to each other into the
    // same bins.
    this.maxDiversityIndex = 0;

    for (let i = 0; i < this.individualSize; i++) {

      const maxColorValue = numColors - 1;
      const nextMax = 
        this.maxDiversityValue + maxColorValue * Math.pow(this.numColors, i);

      if (nextMax === Infinity) {
        break;
      }
      else {
        this.maxDiversityValue = nextMax;
        ++this.maxDiversityIndex;
      }

      //console.log(this.maxDiversityValue);
      //console.log(Number.MAX_VALUE);
    }
  }

  run() {

    console.log("Running GA");

    this.population = this.randomPopulation();


    let overallMaxFitness = 0;
    let overallMaxIndividual = null;

    let maxFitness
    let maxIndividual;

    for (let i = 0; i < this.numGenerations; i++) {

      this.doGeneration(i);
      
      [maxFitness, maxIndividual] = this.computeStats();

      if (maxFitness > overallMaxFitness) {
        overallMaxFitness = maxFitness;
        overallMaxIndividual = maxIndividual;
      }

      if (maxFitness === 1) {
        console.log("Optimum coloring found. Stopping");
        break;
      }
    }

    console.log("GA done");
    console.log("Report:");
    console.log("Max Individual Final Generation:");
    console.log(maxIndividual + ": " + maxFitness);
    console.log("Max Individual Overall:");
    console.log(overallMaxIndividual + ": " + overallMaxFitness);
  }

  doGeneration(index) {

    let newPopulation = [];

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

    if (index % 100 === 0) {

      const numRandos = 990;
      const newRandoms = [];
      for (let i = 0; i < numRandos; i++) {
        newRandoms.push(this.randomIndividual());
      }

      newPopulation.sort((a, b) => {
        const fitA = this.fitness(a);
        const fitB = this.fitness(b);
        return fitB - fitA;
      });

      console.log(this.fitness(newPopulation[0]));
      console.log(this.fitness(newPopulation[newPopulation.length-1]));

      newPopulation = newPopulation.slice(0, this.populationSize-numRandos)
        .concat(newRandoms);

      if (newPopulation.length !== this.populationSize) {
        console.log(newPopulation.length);
        throw "fail wrong size";
      }
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

  computeStats() {

    let maxFitness = 0;
    let minFitness = 1.0;

    let sum = 0;
    let maxIndividual = null;
    let minIndividual = null;

    const uniqueSolutions = new Set();

    for (let individual of this.population) {
      const fitness = this.fitness(individual)
      sum += fitness;

      uniqueSolutions.add(individual);

      //console.log(individual + ": " + fitness);
      if (fitness > maxFitness) {
        maxFitness = fitness;
        maxIndividual = individual;
      }

      if (fitness < minFitness) {
        minFitness = fitness;
        minIndividual = individual;
      }
    }

    const uniqueSolutionDiversity =
      uniqueSolutions.size / this.population.length;

    const averageFitness = sum / this.population.length;

    const [diversityVariance, diversitySpread] = this.computeDiversity();

    //console.log("Average fitness: " + averageFitness);
    //console.log("Max fitness: " + maxFitness);
    //console.log("Max individual: " + maxIndividual);
    //console.log("Ratio of unique solutions: " + uniqueSolutionDiversity);
    //console.log("Variance: " + diversityVariance);
    this.sendMessage({
      topic: 'stats_update',
      averageFitness,
      maxFitness,
      maxIndividual,
      minFitness,
      minIndividual,
      uniqueSolutionDiversity,
      diversityVariance,
      diversitySpread,
      colorIndices: this.colorIndices(maxIndividual),
    });

    return [maxFitness, maxIndividual];
  }

  colorIndices(individual) {

    const indices = [];

    for (let colorChar of individual) {
      indices.push(COLOR_INDEX_MAP[colorChar]);
    }

    return indices;
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

  fitness(individual) {

    if (this.fitnessType === 'standard') {
      return this.standardFitness(individual);
    }
    else if (this.fitnessType === 'balanced') {
      return this.balancedFitness(individual);
    }
    else {
      throw "Invalid fitness type";
    }
  }

  standardFitness(individual) {

    const edges = this.graph.edges;

    let sum = 0;
    for (let edge of edges) {

      if (individual[edge.source] !== individual[edge.target]) {
        ++sum;
      }
    }

    return sum/edges.length;
  }

  balancedFitness(individual) {

    const standardFitness = this.standardFitness(individual);
    //const vertices = this.graph.vertices;

    const counts = {};

    for (let color of individual) {
      
      if (!counts[color]) {
        counts[color] = 1;
      }
      else {
        ++counts[color];
      }
    }

    const numVertices = this.individualSize;

    const perfectCount = numVertices / this.numColors;

    let sum = 0;
    for (let key in counts) {
      sum += Math.abs(counts[key] - perfectCount);
    }

    //const balancedFitness = standardFitness * product;

    //return balancedFitness;
    return Math.abs(sum - numVertices);
  }

  balancedFitnessNoWorky(individual) {

    const standardFitness = this.standardFitness(individual);
    //const vertices = this.graph.vertices;

    const counts = {};

    for (let color of individual) {
      
      if (!counts[color]) {
        counts[color] = 1;
      }
      else {
        ++counts[color];
      }
    }

    //console.log(counts);

    let product = 1;

    const numVertices = this.individualSize;

    for (let key in counts) {
      product *= (counts[key] / numVertices);
    }

    const balancedFitness = standardFitness * product;

    return balancedFitness;
  }

  computeDiversity() {

    let max = 0;
    let maxIndividual = '';

    for (let i = 0; i < this.population.length; i++) {
      this.diversity[i] = this.individualAsNumber(this.population[i]);

      if (this.diversity[i] > max) {
        max = this.diversity[i];
        maxIndividual = this.population[i];
      }

      this.populationFitness[i] = this.fitness(this.population[i]);
    }

    const start = performance.now();
    // compute diversity spread metric
    let spread = 0;
    for (let i = 0; i < this.diversity.length; i++) {

      this.diversitySpread[i] = 0;

      for (let j = 0; j < this.diversity.length; j++) {

        const diff = Math.abs(this.diversity[i] - this.diversity[j])
        this.diversitySpread[i] += diff;

        spread += diff;
      }
    }
    const maxSpread = this.diversity.length*this.diversity.length;
    const diversitySpread = spread/maxSpread;
    const elapsed = performance.now() - start;
    //console.log("elapsed: " + elapsed);
    //console.log("spread: " + diversitySpread);

    //console.log("maxDiv: " + max);
    //console.log(maxIndividual);

    this.sendMessage({
      topic: 'diversity_update',
      diversity: this.diversity,
      fitness: this.populationFitness,
    });

    return [calculateVariance(this.diversity), diversitySpread];
  }

  individualAsNumber(individual) {

    let value = 0;
    for (let i = 0; i < this.maxDiversityIndex; i++) {

      const char = individual[i];
      const colorValue = COLOR_INDEX_MAP[char];
      value += colorValue * Math.pow(this.numColors, i);
    }

    const diversity = value / this.maxDiversityValue;

    if (diversity === Infinity) {
      console.log("WARNING: infinite diversity detected");
    }

    return diversity;
  }
}

module.exports = {
  GraphColoringGA,
  ALPHABET: ALPHABET
};
