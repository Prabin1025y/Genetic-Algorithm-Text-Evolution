// Population class for managing a collection of DNAs
class Population {
    constructor(target, popCount, mutationRate) {
        this.population = [];
        this.target = target;
        this.mutationRate = mutationRate;
        this.generations = 0;
        this.finished = false;
        this.currentPhrase = "";
        this.bestScore = 0;
        this.bestfitness = 0;
        this.averageScore = 0;
        this.maxfitness = pow(Math.E, target.length)
        
        // Initialize population
        for (let i = 0; i < popCount; i++) {
            this.population.push(new DNA(target.length));
        }
        
        // Initial fitness calculation
        this.calculateFitness();
    }

    // Calculate fitness for all members of the population
    calculateFitness() {
        let totalScore = 0;
        
        this.population.forEach(dna => {
            const score = dna.calculateFitness(this.target);
            totalScore += score;
        });
        
        this.averageScore = totalScore / this.population.length;
    }

    pickOne(population){
        const totalFitness = population.reduce((a, dna)=> a + dna.fitness, 0);
        let index = 0;
        let r = random(totalFitness)
        while(true){
            // console.log(totalFitness)
            r -= population[index].fitness;
            if(r <= 0){
                console.log("hello")
                return population[index];}
            index++;
        }
    }

    // Create a new generation
    generate() {
        // Create new population
        const newPopulation = [];
        
        for (let i = 0; i < this.population.length; i++) {
            // Select parents from mating pool

            
            const parentA = this.pickOne(this.population);
            const parentB = this.pickOne(this.population);
            
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
        if (bestIndividual.score > this.bestScore) {
            this.bestScore = bestIndividual.score;
            
            
            // Check if we've reached our target
            if (this.currentPhrase === this.target) {
                this.finished = true;
            }
        }
        
        return {
            bestPhrase: this.currentPhrase,
            bestScore: this.bestScore/this.target.length,
            generation: this.generations,
            averageScore: this.averageScore/ this.target.length,
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
                score: dna.score/ this.target.length
            };
        });
    }
}