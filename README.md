# GANN
Neural Network that uses Genetic Algorithm as training method

<h3><b>How to use the code:</b></h3>
Link to file like:
```
<script src="GANN/NeuralNetwork.js"></script>
```

To make a new Neural Network:
```
var networkSize = [2, 3, 4, 3];
var NN = new NeuralNet();
NN.makeNet(networkSize);
```

To make the Gene population:
```
var networkSize = [2, 3, 4, 3];
.
.
var sizeOfPopulation = 100;

var PP = new Population();
PP.makePopulation(sizeOfPopulation, networkSize);
```


To train the network:
```
for(var g = 0; g < wantedGenerations; g++){
  for(var j = 0; j < PP.size; j++){
    var fitness = 0;
    .
    .
    NN.addGenome(PP.genome[j]);
    .
    .
    var output = NN.getOutput( input );
    .
    .
    fitness = doSomeThingWithOutput( output );
    .
    .
    PP.genome[j].fitness = fitness;
    .
    .
  }
  PP.newGeneration();
}
.
.
var bestFoundGenome = new Genome();
bestFoundGenome = PP.globalBestGenome();
.
.
NN.addGenome(bestFoundGenome);
.
.
```
