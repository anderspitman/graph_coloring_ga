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

module.exports = {
  sum: sum,
  mean: calculateMean,
  variance: calculateVariance,
};
