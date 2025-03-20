// p5.js sketch
let population;
let evolutionInterval;
let startTime;
let running = false;
let fitnessHistory = [];
let avgFitnessHistory = [];
let p5Canvas;

// p5.js setup function
function setup() {
    // Create canvas in the p5-canvas div
    // p5Canvas = createCanvas(800, 150);
    // p5Canvas.parent('p5-canvas');
    
    // UI Controls
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const resetBtn = document.getElementById('reset');
    const targetInput = document.getElementById('target');
    const popsizeInput = document.getElementById('popsize');
    const mutationInput = document.getElementById('mutation');
    const speedInput = document.getElementById('speed');
    
    // Event listeners
    startBtn.addEventListener('click', startEvolution);
    stopBtn.addEventListener('click', stopEvolution);
    resetBtn.addEventListener('click', resetEvolution);
    
    // Initialize
    initializePopulation();
}

// p5.js draw function
// function draw() {
//     background(240);
    
//     // Draw fitness history graph
//     if (fitnessHistory.length > 1) {
//         // Calculate scaling factors based on the full dataset
//         const maxDataPoints = fitnessHistory.length;
//         const scaleX = width / (maxDataPoints - 1);
        
//         // Draw average fitness
//         stroke(46, 204, 113, 150);
//         strokeWeight(1);
//         noFill();
//         beginShape();
//         for (let i = 0; i < avgFitnessHistory.length; i++) {
//             const x = i * scaleX;
//             const y = map(1 - avgFitnessHistory[i], 0, 1, 0, height);
//             vertex(x, y);
//         }
//         endShape();
        
//         // Draw best fitness
//         stroke(52, 152, 219);
//         strokeWeight(2);
//         noFill();
//         beginShape();
//         for (let i = 0; i < fitnessHistory.length; i++) {
//             const x = i * scaleX;
//             const y = map(1 - fitnessHistory[i], 0, 1, 0, height);
//             vertex(x, y);
//         }
//         endShape();
//     }
    
//     // Draw labels
//     fill(50);
//     noStroke();
//     textSize(12);
//     text("Fitness Over Time", 10, 20);
    
//     // Draw scale
//     textAlign(RIGHT);
//     text("1.0", width - 10, 20);
//     text("0.0", width - 10, height - 10);
//     textAlign(LEFT);
    
//     // Show current generation count
//     if (fitnessHistory.length > 0) {
//         text(`Generation: ${fitnessHistory.length}`, 10, height - 10);
//     }
// }

// Helper function to format time
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to highlight matching characters
function highlightMatches(phrase, target) {
    let result = '';
    for (let i = 0; i < phrase.length; i++) {
        if (i < target.length && phrase[i] === target[i]) {
            result += `<span class="phrase-match">${phrase[i]}</span>`;
        } else {
            result += phrase[i];
        }
    }
    return result;
}

// Update chart with new data
function updateChart(generation, bestFitness, avgFitness) {
    // Add data to history arrays for p5 visualization
    fitnessHistory.push(bestFitness);
    avgFitnessHistory.push(avgFitness);
    
    // Keep arrays at a reasonable size for p5 visualization
    // if (fitnessHistory.length > 100) {
    //     fitnessHistory.shift();
    //     avgFitnessHistory.shift();
    // }
    
    // Update Chart.js visualization
    const ctx = document.getElementById('fitness-chart').getContext('2d');
    const chartExists = Chart.getChart(ctx);
    
    if (chartExists) {
        // Only add data point every few generations to keep chart performant
        if (generation % 5 === 0 || generation === 1) {
            chartExists.data.labels.push(generation);
            chartExists.data.datasets[0].data.push(bestFitness);
            chartExists.data.datasets[1].data.push(avgFitness);
            
            // Update chart with automatic scale adjustment
            chartExists.update();
            
            // Adjust x-axis scaling when data gets too large
            if (chartExists.data.labels.length > 50) {
                // Instead of removing data, adjust the x-axis options
                chartExists.options.scales.x.min = 0;
                chartExists.options.scales.x.max = generation;
                
                // Enable zooming out as more data comes in
                if (!chartExists.options.plugins.zoom) {
                    chartExists.options.plugins.zoom = {
                        pan: {
                            enabled: true,
                            mode: 'x'
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        }
                    };
                }
                
                chartExists.update();
            }
        }
    } else {
        // Create new chart if it doesn't exist
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: [generation],
                datasets: [{
                    label: 'Best Fitness',
                    data: [bestFitness],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderWidth: 2,
                    tension: 0.1
                }, {
                    label: 'Average Fitness',
                    data: [avgFitness],
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    borderWidth: 2,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Fitness'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Generation'
                        },
                        ticks: {
                            // This will help with large datasets
                            autoSkip: true,
                            maxTicksLimit: 20
                        }
                    }
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x'
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        }
                    }
                }
            }
        });
    }
}

// Update UI with current state
function updateUI(state) {
    const generationEl = document.getElementById('generation');
    const bestFitnessEl = document.getElementById('best-fitness');
    const avgFitnessEl = document.getElementById('avg-fitness');
    const elapsedTimeEl = document.getElementById('elapsed-time');
    const bestPhraseEl = document.getElementById('best-phrase');
    const sampleListEl = document.getElementById('sample-list');
    const progressBar = document.getElementById('fitness-progress');
    const targetInput = document.getElementById('target');
    
    generationEl.textContent = state.generation;
    bestFitnessEl.textContent = `${Math.round(state.bestScore * 100)}%`;
    avgFitnessEl.textContent = `${Math.round(state.averageScore * 100)}%`;
    
    // Update progress bar
    progressBar.value = state.bestScore * 100;
    
    // Update best phrase with highlighted matches
    bestPhraseEl.innerHTML = highlightMatches(state.bestPhrase, targetInput.value);
    
    // Update elapsed time
    if (running) {
        const elapsed = Date.now() - startTime;
        elapsedTimeEl.textContent = formatTime(elapsed);
    }
    
    // Sample population for display
    const sample = population.getSample(25);
    const maxFitness = 
    sampleListEl.innerHTML = '';
    
    sample.forEach(item => {
        const phraseEl = document.createElement('div');
        phraseEl.className = 'phrase-item';
        phraseEl.innerHTML = `${highlightMatches(item.phrase, targetInput.value)} (${Math.round(item.score * 100)}%)`;
        sampleListEl.appendChild(phraseEl);
    });
    
    // Update chart
    updateChart(state.generation, state.bestScore, state.averageScore);
    
    // Check if we're done
    if (state.isFinished && running) {
        stopEvolution();
        bestPhraseEl.classList.add('highlight');
        setTimeout(() => {
            bestPhraseEl.classList.remove('highlight');
        }, 1500);
    }
}

// Initialize new population
function initializePopulation() {
    const targetInput = document.getElementById('target');
    const popsizeInput = document.getElementById('popsize');
    const mutationInput = document.getElementById('mutation');
    
    const target = targetInput.value;
    const popsize = parseInt(popsizeInput.value);
    const mutation = parseFloat(mutationInput.value) / 100;
    
    population = new Population(target, popsize, mutation);
    fitnessHistory = [];
    avgFitnessHistory = [];
    
    // Reset UI
    const generationEl = document.getElementById('generation');
    const bestFitnessEl = document.getElementById('best-fitness');
    const avgFitnessEl = document.getElementById('avg-fitness');
    const elapsedTimeEl = document.getElementById('elapsed-time');
    const bestPhraseEl = document.getElementById('best-phrase');
    const progressBar = document.getElementById('fitness-progress');
    
    generationEl.textContent = '0';
    bestFitnessEl.textContent = '0%';
    avgFitnessEl.textContent = '0%';
    elapsedTimeEl.textContent = '0:00';
    bestPhraseEl.textContent = 'Waiting to start...';
    progressBar.value = 0;
    
    // Reset chart
    const ctx = document.getElementById('fitness-chart').getContext('2d');
    const chartExists = Chart.getChart(ctx);
    
    if (chartExists) {
        chartExists.data.labels = [];
        chartExists.data.datasets.forEach(dataset => {
            dataset.data = [];
        });
        chartExists.update();
    }
}

// Run one generation of evolution
function evolve() {
    population.generate();
    population.calculateFitness();
    const state = population.evaluate();
    updateUI(state);
}

// Start evolution process
function startEvolution() {
    resetEvolution()
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const targetInput = document.getElementById('target');
    const popsizeInput = document.getElementById('popsize');
    const speedInput = document.getElementById('speed');
    
    if (running) return;
    running = true;
    startTime = Date.now();
    
    // Initialize if not already
    if (!population) {
        initializePopulation();
    }
    
    // Update buttons
    startBtn.disabled = true;
    stopBtn.disabled = false;
    targetInput.disabled = true;
    popsizeInput.disabled = true;
    
    // Start evolution loop
    evolutionInterval = setInterval(() => {
        const iterationsPerFrame = parseInt(speedInput.value);
        
        // Run multiple iterations for increased speed
        for (let i = 0; i < iterationsPerFrame; i++) {
            evolve();
            
            // Break if we've found our target
            if (population.finished) {
                stopEvolution();
                break;
            }
        }
    }, 50);
}

// Stop evolution process
function stopEvolution() {
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const targetInput = document.getElementById('target');
    const popsizeInput = document.getElementById('popsize');
    
    running = false;
    clearInterval(evolutionInterval);
    
    // Update buttons
    startBtn.disabled = false;
    stopBtn.disabled = true;
    targetInput.disabled = false;
    popsizeInput.disabled = false;
}

// Reset everything
function resetEvolution() {
    const sampleListEl = document.getElementById('sample-list');
    
    stopEvolution();
    initializePopulation();
    sampleListEl.innerHTML = '';
}