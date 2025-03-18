// Population class for managing a collection of DNAs
class Population {
    constructor(target, popCount, mutationRate) {
        this.population = [];
        this.matingPool = [];
        this.target = target;
        this.mutationRate = mutationRate;
        this.generations = 0;
        this.finished = false;
        this.currentPhrase = "";
        this.bestScore = 0;
        this.averageFitness = 0;
        
        // Initialize population
        for (let i = 0; i < popCount; i++) {
            this.population.push(new DNA(target.length));
        }
        
        // Initial fitness calculation
        this.calculateFitness();
    }

    // Calculate fitness for all members of the population
    calculateFitness() {
        let totalFitness = 0;
        
        this.population.forEach(dna => {
            const fitness = dna.calculateFitness(this.target);
            totalFitness += fitness;
        });
        
        this.averageFitness = totalFitness / this.population.length;
    }

    // Create mating pool based on fitness values
    naturalSelection() {
        this.matingPool = [];
        let maxFitness = 0;
        
        this.population.forEach(dna => {
            if (dna.fitness > maxFitness) {
                maxFitness = dna.fitness;
            }
        });
        
        this.population.forEach(dna => {
            // Normalize fitness between a and 1
            let normalizedFitness = dna.fitness / maxFitness;
            // Scale to determine representation in mating pool
            let numberOfChildInPool = Math.floor(normalizedFitness * 100);
            
            for (let i = 0; i < numberOfChildInPool; i++) {
                this.matingPool.push(dna);
            }
        });
    }

    // Create a new generation
    generate() {
        // Create new population
        const newPopulation = [];
        
        for (let i = 0; i < this.population.length; i++) {
            // Select parents from mating pool
            const parentA = this.matingPool[Math.floor(Math.random() * this.matingPool.length)];
            const parentB = this.matingPool[Math.floor(Math.random() * this.matingPool.length)];
            
            // Create child through crossover
            const child = parentA.crossover(parentB);
            
            // Apply mutation
            child.mutate(this.mutationRate);
            
            // Add to new population
            newPopulation.push(child);
        }
        
        // Replace old population
        this.population = newPopulation;
        this.generations++;
    }

    // Evaluate current population
    evaluate() {
        // Find best individual in population
        let bestIndividual = this.population[0];
        
        for (let i = 0; i < this.population.length; i++) {
            if (this.population[i].fitness > bestIndividual.fitness) {
                bestIndividual = this.population[i];
                this.currentPhrase = this.population[i].getStringFromGenes();
            }
            
        }
        
        // Update best overall if this one is better
        if (bestIndividual.fitness > this.bestScore) {
            this.bestScore = bestIndividual.fitness;
            
            
            // Check if we've reached our target
            if (this.bestScore === 1) {
                this.finished = true;
            }
        }
        
        return {
            bestPhrase: this.currentPhrase,
            bestScore: this.bestScore,
            generation: this.generations,
            averageFitness: this.averageFitness,
            isFinished: this.finished
        };
    }

    // Get a sample of the population for display
    getSample(count) {
        // Sort by fitness
        const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
        // Return the top 'count' individuals
        return sorted.slice(0, count).map(dna => {
            return {
                phrase: dna.getStringFromGenes(),
                fitness: dna.fitness
            };
        });
    }
}