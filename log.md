# 2018-01-30

* https://github.com/subprotocol/genetic-js
    * http://subprotocol.com/system/genetic-hello-world.html
* https://en.wikipedia.org/wiki/Crossover_(genetic_algorithm)#Two-point_crossover
* https://en.wikipedia.org/wiki/Tournament_selection


# 2018-01-31

* Consider using something like base64 encoding to represent colors. This would
  make the size of every allele a single character. As long as we have enought
  letters in the alphabet this should solve the "unused bits" problem mention
  in the assignment.
* Generating random 0s and 1s seems to be problematic, as she said it could be.
  There's a strong tendency for equal numbers of 0s and 1s, especially as the
  length becomes longer.
* I'm assuming the population is always supposed to be the exact same size
  from generation to generation?


# 2018-02-06

* Encoding needs to represent nodes, not edges
* Todo:
    * Implement graph visualization
    * Implement diversity metric


# 2018-02-07

* Wasn't converging because I had a bug in my edgelist parsing that let
  junk nodes through.
* Seems like it might be running much faster comparing integers instead of
  strings for node ids


# 2018-02-08

* Got diversity plot working. It's awesome
* Use machine learning to predict whether the GA will be successful by looking
  at the first few lines of diversity plot?
* Todo
    * Track % of search space searched
    * Visualize where the max fitness is in the search space
        * possible track across runs
    * Add a histogram of the diversity distribution


# 2018-02-09

* For diversity visualization for numbers that are too large, should be able
  to "bin" it by look at just the top n bits, and putting everything that falls
  under that value into the same bin. It's more coarse, but for large numbers
  you wouldn't be able to see it anyway.


# 2018-02-10

* [After 2 hours of debugging] my Erdos Renyi implementation appears to not
  be properly guarding against self-loops
