// DNA class for representing individual solutions
class DNA {
    constructor(numOfGenes) {
        this.genes = [];
        this.fitness = 0;

        for (let i = 0; i < numOfGenes; i++) {
            this.genes[i] = this.randomChar();
        }
    }

    // Generate a random character
    randomChar() {
        return String.fromCharCode(Math.floor(Math.random() * (126 - 32 + 1)) + 32);
    }

    // Convert genes array to string
    getStringFromGenes() {
        return this.genes.join("");
    }

    // Calculate fitness score
    calculateFitness(target) {
        let score = 0;
        for (let i = 0; i < this.genes.length; i++) {
            if (this.genes[i] === target.charAt(i)) {
                score ++;
            }
        }
        this.fitness = score / target.length;
        return this.fitness;
    }

    // Crossover DNA with partner
    crossover(partner) {
        let child = new DNA(this.genes.length);

        let breakPoint = Math.floor(Math.random() * this.genes.length);
        for (let i = 0; i < this.genes.length; i++) {
            child.genes[i] = (i < breakPoint) ? this.genes[i] : partner.genes[i];
        }

        return child;
    }

    // Mutate genes based on mutation rate
    mutate(mutationRate) {
        for (let i = 0; i < this.genes.length; i++) {
            if (Math.random() < mutationRate) {
                this.genes[i] = this.randomChar();
            }
        }
    }
}