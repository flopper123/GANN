
class NE {
	constructor(netArchitecture, populationSize, learningRate) {
		this.netArchitecture = netArchitecture;
		this.populationSize  = populationSize;
		this.population		 = [];
		
		// Optimization
		this.netOffset	= [];
		this.generation = 0;
		
		// Training
		this.learningRate = learningRate;
	}
	
	nextGeneration()
	{
		this.population.sort(function(a, b) {
			return b.fitness - a.fitness; // 0 will be the best subject
		});
		
		this.resetAllFitnesses(); // Set all fitnesses to 0
		
		var localBestGenome = this.population[0].genome.slice();
		
		for(var i = 0; i < this.population.length-1; i++)
		{
			for(var j = 0; j < this.population[i].genome.length; j++)
			{
				this.population[i].genome[j] = this.population[i].genome[j] + this.normalDistribution(4)*this.learningRate;
			}
		}
		
		this.population[this.population.length-1].genome = localBestGenome; // Remove last species and assign the local best to it
	}
	
	setLearningRate(learningRate)
	{
		this.learningRate = learningRate;
	}
	getLearningRate()
	{
		return this.learningRate;
	}
	
	localFittest() { // Finds the as of yet best subject
		var fittest = { // Stores object for later
			fitness: 0,
			index: 0
		};
		
		for(var i = 0; i < this.population.length; i++) // Loops through the whole population
		{
			if(this.population[i].fitness > fittest.fitness) // If we have found a better one, store that instead
			{
				fittest.fitness = this.population[i].fitness;
				fittest.index 	= i;
			}
		}
		return fittest;
	}
	
	resetFitness(subject) { // Resets a subjects fitness score to 0
		this.population[subject].fitness = 0;
	}
	
	resetAllFitnesses() { // Resets whole populations fitness to 0
		for(var i = 0; i < this.populationSize; i++)
		{
			this.resetFitness(i);
		}
	}
	
	addFitness(subject, fitness) { // Add a fitness score to subjects fitness score
		this.population[subject].fitness += fitness;
	}
	
	activation(value) // Sigmoid curve
	{
		return 1/(1+Math.exp(-value));
	}
	
	input(subject, net, data)
	{
		var currentLayer = data.slice();
		currentLayer.push(1); // Add bias node to input
		
		for(var i = 0; i < this.netArchitecture[net].length-1; i++) // Loop through the layers of a specific net
		{
			var nextLayer = new Array(this.netArchitecture[net][i+1]-1); // Do not add bias
			nextLayer.fill(0);
			
			for(var j = 0; j < this.netArchitecture[net][i]; j++) // Loop through neurons of the layer
			{
				for(var k = 0; k < this.netArchitecture[net][i+1]-1; k++) // Loop through neurons in next layer (not bias)
				{
					nextLayer[k] += currentLayer[j]*this.population[subject].genome[this.netOffset[net][j]+k]; // Add value of neuron multiplied with it's weight
				}
			}
			for(var k = 0; k < this.netArchitecture[net][i+1]-1; k++) // Loop through neurons in next layer (not bias node)
			{
				nextLayer[k] = this.activation(nextLayer[k]);
			}	
			currentLayer = nextLayer;
			currentLayer.push(1); // Add bias node
		}
		currentLayer.pop(); // Remove bias node before returning
		return currentLayer;
	}
	
	
	normalDistribution(limit) {
		var sum = 0;
		for(let i = 0; i < 6; i++)
		{
			sum += Math.random();
		}
		return ((sum/6)-0.5)*limit*2; // Returns value in between [-limit; limit[
	}
	
	generateGenome() {
		var genome = []; // Stores the array of weights
		
		for(var i = 0; i < this.netArchitecture.length; i++) // Loop through each individual net except the last
		{
			for(var j = 0; j < this.netArchitecture[i].length-1; j++) // Loop through each layer
			{
				for(var k = 0; k < this.netArchitecture[i][j]*(this.netArchitecture[i][j+1]-1); k++) // Loop through each weight between the two layers (not the bias)
				{
					genome.push(this.normalDistribution(10)); // Generate weights
				}
			}
		}
		
		return genome;
	}
	
	initialize() {
		
		// Change network to support bias nodes
		for(var i = 0; i < this.netArchitecture.length; i++) // Loop through each individual net
		{
			var layerOffset = [];
			for(var j = 0; j < this.netArchitecture[i].length; j++) // Loop through each layer	
			{
				this.netArchitecture[i][j]++;
			}
		}
		
		for(let i = 0; i < this.populationSize; i++)
		{
			this.population.push({
				genome: this.generateGenome(),
				fitness: 0
			});
		}
		
		var currentLocation = 0;
		for(var i = 0; i < this.netArchitecture.length; i++) // Loop through each individual net
		{
			var layerOffset = [];
			for(var j = 0; j < this.netArchitecture[i].length-1; j++) // Loop through each layer except the last
			{
				for(var k = 0; k < this.netArchitecture[i][j]; k++) // Loop through each neuron
				{						
					layerOffset.push(currentLocation); // Save current location
					currentLocation += this.netArchitecture[i][j+1]-1; // Add number of connections (not bias)
				}
			}
			this.netOffset.push(layerOffset); // Add to big array
		}
	}
}

