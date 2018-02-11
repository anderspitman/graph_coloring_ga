const utils = require('./utils.js');
const GA = require('./genetic_algorithm.js');

function run(ALPHABET, COLOR_INDEX_MAP, validColoring, numColors) {

  //const validColoring = 'abecddcebedbcabecaedadbca';
  //const validColoring = 'abcd';
  //console.log(validColoring.length);
  //console.log("Length should be: " + validColoring.length * (numColors - 1));

  const oneStepIndividuals = [];
  const set = new Set();

  for (let i = 0; i < validColoring.length; i++) {

    let currentColor = validColoring[i];

    for (let j = 0; j < numColors; j++) {

      // don't duplicate
      //if (GA.ALPHABET[j] !== currentColor) {
      if (ALPHABET[j] !== validColoring[i]) {
        const newColor = nextColor(currentColor)
        const newIndividual =
          utils.replaceAt(validColoring, i, newColor);
        oneStepIndividuals.push(newIndividual);
        set.add(newIndividual);
        currentColor = newColor;
      }
    }
  }

  //console.log(oneStepIndividuals);
  //console.log("Set size: " + set.size);

  function nextColor(color) {

    const index = COLOR_INDEX_MAP[color];

    if (index >= numColors) {
      throw "Invalid color";
    }

    const nextIndex = index + 1;

    if (nextIndex === numColors) {
      return ALPHABET[0];
    }
    else {
      return ALPHABET[nextIndex];
    }
  }

  return oneStepIndividuals;
}

module.exports = {
  run
};
