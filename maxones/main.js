const randomBit = () => {
  return Math.floor(Math.random() * 2);
};

// from: https://stackoverflow.com/a/10784675/943814
function replaceAt(s, n, t) {
    return s.substring(0, n) + t + s.substring(n + 1);
}

class MaxOnesGA {

  constructor({
      individualSize=10,
      populationSize=100,
      numGenerations=100,
      mutationRate=0.1,
      crossoverRate=0.4,
    }) {

    this.individualSize = individualSize;
    this.populationSize = populationSize;
    this.numGenerations = numGenerations;
    this.mutationRate = mutationRate;
    this.crossoverRate = crossoverRate;

    this.population = this.randomPopulation();
  }

  randomIndividual() {

    let str = '';
    for (let i = 0; i < this.individualSize; i++) {
      str = str.concat(randomBit());
    }

    return str;
  }

  randomPopulation() {

    let population = [];

    for (let i = 0; i < this.populationSize; i++) {
      const individual = this.randomIndividual();
      population.push(individual);
    }

    return population;
  }

  fitness(individual) {

    let sum = 0;
    for (let char of individual) {
      sum += Number(char);
    }

    return sum;
  }

  maxFitness() {

    let max = 0;
    for (let individual of this.population) {
      const fitness = this.fitness(individual)
      if (fitness > max) {
        max = fitness;
      }
    }

    return max;
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

    console.log("mutation ratio: " + numMutated/this.populationSize);
    
  }

  mutateIndividual(i) {

    const mutationIndex = Math.floor(Math.random() * this.individualSize);

    const oldBit = this.population[i][mutationIndex];

    let newBit;
    if (oldBit === '0') {
      newBit = '1';
    }
    else if (oldBit === '1') {
      newBit = '0';
    }
    else {
      throw "Invalid bit value";
    }

    this.population[i] = replaceAt(this.population[i], mutationIndex, newBit);
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

  crossoverPopulation() {

    let numCrossed = 0;
    for (let i = 0; i < this.selectPopulation.length; i++) {

      const crossover = Math.random() <= this.crossoverRate;

      if (crossover) {
        numCrossed++;
        //this.mutateIndividual(i);
      }
    }

    console.log("crossover ratio: " + numCrossed/this.populationSize);
  }

  run() {

    for (let i = 0; i < this.numGenerations; i++) {
      console.log("Running generation: " + (i + 1));
      this.mutatePopulation();
      this.selectPopulation();
      //this.crossoverPopulation();
      console.log(this.maxFitness());
    }
  }
}

const ga = new MaxOnesGA ({
  populationSize: 100,
  individualSize: 100,
  numGenerations: 200,
  mutationRate: 0.1,
});

ga.run();
