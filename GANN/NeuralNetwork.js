/* Sigmoid curve */
function sigmoid(z){
	return 1/(1 + Math.pow( Math.E, z*(-1))); /* Sigmoid curve equation */
}

/* Create Neuron class */
function Neuron(){
	this.weight = []; /* Define weight as an array */
	
	this.sum = 1; /* Save the sum of Neuron (Start with one for bias handler) */	
	
	this.setWeight = function(theGene) { /* Set weight from gene */
		var geneArray = theGene.split(':'); /* Split the part of the gene into smaller pieces */
		for(var i = 0; i < geneArray.length; i++){ /* Run through the different commands */
			var readableGene = geneArray[i].split('.'); /* Finde index value */
			this.weight[i] = parseInt(readableGene[1], 2); /* Set the weight from readable command */
			if(readableGene[0] == 0){ /* If index is 0 then it should be a negative command */
				this.weight[i] *= -1;
			}
		}
	}
	
	this.weigthInput = function(lastLayer){ /* Neuron feedforward */
		this.sum = 0;
		for(var i = 0; i < lastLayer.neuron.length; i++){ /* Run through last layer */
			this.sum += (lastLayer.neuron[i].sum * this.weight[i]); /* Weight individual neurons */
		}
		this.sum = sigmoid(this.sum); /* Activate it */
		if(this.sum > 0.999){
			this.sum = 1;
		} else if(this.sum < 0.001){
			this.sum = 0;
		}
	}
}

/* Create Layer class */
function Layer(){
	this.neuron = []; /* Placeholder for neurons */
	
	this.makeNeurons = function(numberOfNeurons){ /* Create wanted number of neurons */
		for(var i = 0; i < numberOfNeurons+1; i++){ /* Add bias */
			this.neuron[i] = new Neuron();
		}
	}
	
	this.addPieceOfGenome = function(layerPieceOfGenome){ /* Use part of genome */
		var neuronPiecesOfGenome = layerPieceOfGenome.split('-'); /* Split it, so that a single neuron can use them */
		for(var i = 0; i < neuronPiecesOfGenome.length; i++){
			this.neuron[i].setWeight(neuronPiecesOfGenome[i]); /* Run through the different genes, and let the neurons handle the rest */
		}
	}
	
	this.weigthInput = function(lastLayer){ /* Calculate all the sumes */
		
		for(var i = 0; i < this.neuron.length; i++){ /* Loop through all neurons */
			this.neuron[i].weigthInput(lastLayer); /* Do all the weighting */
		}
		
	}
	
	this.getSums = function(){
		var output = [];
		for(var i = 0; i < this.neuron.length-1; i++){ /* Run through layer */
			output[i] = this.neuron[i].sum; /* add sum to output */
		}
		if(output.length == 1){
			return output[0]; /* return output */
		} else {
			return output;
		}
	}
	
	
}

/* Genome class */
function Genome(){
	this.genome = "";
	this.fitness = 0;
	
	
	this.randomBinary = function(){
		return Math.round(Math.random()); /* Return either 1 or 0 */
	}
	this.newGenome = function(netSize){
		for(var x = 1; x < netSize.length; x++){ /* We don't need genes for the first layers, since that it's just input */
			for(var y = 0; y < (netSize[x]+1); y++){ /* Loop through layer */
				for(var z = 0; z < (netSize[x-1]+1); z++){ /* Loop through every connection */
					this.genome += this.randomBinary().toString() + "."; /* Add if number is positiv or negative */
					for(var b = 0; b < 7; b++){ /* Make the binary code, raging from: 0000000 - 1111111 */
						this.genome += this.randomBinary().toString(); /* Add a bit :P */
					}
					this.genome += ":"; /* Tell that a gene is done */
				}
				this.genome = this.genome.slice(0, -1);
				this.genome += "-".toString();
			}
			this.genome = this.genome.slice(0, -1);
			this.genome += "#".toString(); /* Tell that a layer is done */
		}
		this.genome = this.genome.slice(0, -1); /* Remove the last three characters ':-#' */
	}
}

/* Population class */
function Population(){
	this.genome = []; /* Store genomes */
	this.globalBestGenome = new Genome(); /* This one stores the best genome yet */
	this.generation = 0;
	this.size;
	this.makePopulation = function(sizeOfPop, netSize){ /* Make new population */
		this.size = sizeOfPop;
		this.genome = [];
		for(var p = 0; p < sizeOfPop; p++){ /* Make all the genomes */
			this.genome[p] = new Genome();
			this.genome[p].newGenome(netSize); /* Make the new genome */
		}
	}
	
	this.replaceChar = function(theGenome, index, char){
		return theGenome.substring(0, index) + char + theGenome.substring(index + 1);
	}
	
	this.crossOver = function(parent1, parent2){ /* Do crossover */
		var crossPoint = Math.floor(((Math.random()/2)+(parent1.genome.length/4))*parent1.genome.length); /* Find crossover point */
		var children = []; /* array for children */
		children[0] = new Genome(); /* Make new genomes for children */
		children[1] = new Genome();
		
		children[0].genome = parent1.genome.slice(0, crossPoint) + parent2.genome.slice(crossPoint+1, parent1.genome.length-1); /* Do the crossovers */
		children[1].genome = parent2.genome.slice(0, crossPoint) + parent1.genome.slice(crossPoint+1, parent1.genome.length-1);
		
		/* Add some mutations */
		for(var i = 0; i < 2; i++){
			for(var j = 0; j < children[i].genome.length; j++){
				if(Math.floor(Math.random()*1000) == 500){ /* 0.1% chance */
					if(children[i].genome.charAt(j) == "0"){
						children[i].genome = this.replaceChar(children[i].genome, j, "1");
					} else if(children[i].genome.charAt(j) == "1"){
						children[i].genome = this.replaceChar(children[i].genome, j, "0");
					}
				}
			}
		}
		
		return children; /* Return the children */
	}
	
	this.newGeneration = function(){ /* New generation */
		this.genome.sort(function(a, b){ /* Sort the population from worst to best */
			return a.fitness - b.fitness;
		});
		if(this.genome[this.genome.length - 1].fitness > this.globalBestGenome.fitness){ /* Check if we've found a new best "Genome" */
			this.globalBestGenome = this.genome[this.genome.length - 1];
		}
		for(var i = 0; i < this.genome.length; i+=2){
			var newGenes = [];
			newGenes = this.crossOver(this.genome[i], this.genome[i+1]); /* Do the crossover from the best organism!! */
			this.genome[i] = newGenes[0];
			this.genome[i+1] = newGenes[1];
			
		}
		this.generation++; /* We've reached a new generation!!! */
	}
}

function NeuralNet(){
	this.layer = []; /* Layer storage */
	
	this.genome = new Genome(); /* Make genome */
	
	this.makeNet = function(theLayers){ /* Make network */
		
		this.genome.newGenome(theLayers); /* Make genome */
		
		this.layer = []; /* Reset layers */
		for(var i = 0; i < theLayers.length; i++){ /* Run through wanted layers */
			this.layer[i] = new Layer(); /* Make a new layer */
			this.layer[i].makeNeurons(theLayers[i]);
		}
	}
	
	this.addGenome = function(genome){
		this.genome = genome; /* Add the wanted genome */
		var geneStorage = this.genome.genome.split('#');
		for(var i = 0; i < geneStorage.length; i++){
			this.layer[i+1].addPieceOfGenome(geneStorage[i]);
		}
	}
	
	this.getOutput = function(input){
		for(var j = 0; j < this.layer[0].neuron.length-1; j++){ /* Put input into first layer */
			this.layer[0].neuron[j].sum = input[j];
		}
		
		for(var i = 1; i < this.layer.length; i++){
			this.layer[i].weigthInput(this.layer[i-1]);
		}
		var outputNeurons = this.layer[this.layer.length-1].getSums(); /* Return output layer */
		
		
		return outputNeurons; /* Return the crap */
	}
	
}