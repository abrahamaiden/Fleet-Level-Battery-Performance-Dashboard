// ========================================
// THERMASCAN - EV Battery Digital Twin
// JavaScript Logic & Data Processing
// ========================================

// ========================================
// CONFIGURATION & CONSTANTS
// ========================================
const CONFIG = {
    ROWS: 8,
    COLS: 12,
    TOTAL_CELLS: 96,
    UPDATE_INTERVAL: 2000,      // Update charts every 2 seconds
    FAULT_INTERVAL: 3000,       // Simulate fault every 3 seconds
    TEMP_THRESHOLDS: {
        COOL_MAX: 28,
        NORMAL_MAX: 40,
        ELEVATED_MAX: 45,
        WARNING_MAX: 55,
        CRITICAL: 55
    },
    VOLTAGE_DEVIATION: 0.1,     // 10% deviation threshold
    SOH_CRITICAL: 70            // State of Health critical threshold
};

// ========================================
// GLOBAL STATE
// ========================================
let batteryData = [];
let currentMode = 'normal';
let tempHistory = [];
let sohDistribution = { ranges: [], counts: [] };
let charts = { tempChart: null, sohChart: null };
let faultSimulationActive = false;

// ========================================
// BATTERY CELL DATA CLASS
// ========================================
class BatteryCell {
    constructor(id, row, col) {
        this.id = id;
        this.row = row;
        this.col = col;
        this.temperature = this.randomInRange(25, 35);
        this.voltage = this.randomInRange(3.6, 3.8);
        this.current = this.randomInRange(-5, 20);
        this.soc = this.randomInRange(60, 100);
        this.soh = this.randomInRange(80, 100);
        this.resistance = this.randomInRange(1, 5);
        this.cycles = Math.floor(this.randomInRange(200, 1200));
        this.anomalyStatus = 'NORMAL';
    }

    randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    update() {
        // Small random fluctuations
        this.temperature += (Math.random() - 0.5) * 0.5;
        this.voltage += (Math.random() - 0.5) * 0.01;
        this.current += (Math.random() - 0.5) * 2;
        this.soc += (Math.random() - 0.5) * 0.5;
        
        // Ensure bounds
        this.temperature = Math.max(20, Math.min(60, this.temperature));
        this.voltage = Math.max(3.0, Math.min(4.2, this.voltage));
        this.soc = Math.max(0, Math.min(100, this.soc));
    }

    getTempClass() {
        if (this.temperature < CONFIG.TEMP_THRESHOLDS.COOL_MAX) return 'temp-cool';
        if (this.temperature < CONFIG.TEMP_THRESHOLDS.NORMAL_MAX) return 'temp-normal';
        if (this.temperature < CONFIG.TEMP_THRESHOLDS.ELEVATED_MAX) return 'temp-elevated';
        if (this.temperature < CONFIG.TEMP_THRESHOLDS.WARNING_MAX) return 'temp-warning';
        return 'temp-critical';
    }

    getColor() {
        const temp = this.temperature;
        if (temp < 28) return `rgb(${59 + (temp - 20) * 5}, ${130 + (temp - 20) * 5}, 246)`;
        if (temp < 40) return `rgb(${16 + (temp - 28) * 15}, ${185 - (temp - 28) * 5}, ${129 - (temp - 28) * 10})`;
        if (temp < 45) return `rgb(${251 - (temp - 40) * 5}, ${191 - (temp - 40) * 20}, ${36 - (temp - 40) * 5})`;
        if (temp < 55) return `rgb(${249 - (temp - 45) * 3}, ${158 - (temp - 45) * 10}, ${12 + (temp - 45) * 2})`;
        return `rgb(220, 38, 38)`;
    }
}

// ========================================
// INITIALIZATION
// ========================================
function initialize() {
    console.log('🚀 Initializing THERMASCAN Digital Twin...');
    
    // Generate initial battery data
    generateBatteryData();
    
    // Render battery grid
    renderBatteryGrid();
    
    // Initialize charts
    initializeCharts();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start update loops
    startUpdateLoop();
    startFaultSimulation();
    
    console.log('✅ THERMASCAN initialized successfully!');
}

// ========================================
// BATTERY DATA GENERATION
// ========================================
function generateBatteryData() {
    batteryData = [];
    let cellId = 1;
    
    for (let row = 0; row < CONFIG.ROWS; row++) {
        for (let col = 0; col < CONFIG.COLS; col++) {
            const cell = new BatteryCell(`CELL-${String(cellId).padStart(3, '0')}`, row, col);
            batteryData.push(cell);
            cellId++;
        }
    }
}

// ========================================
// RENDER BATTERY GRID
// ========================================
function renderBatteryGrid() {
    const gridContainer = document.getElementById('batteryGrid');
    gridContainer.innerHTML = '';
    
    batteryData.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.className = `battery-cell ${cell.getTempClass()}`;
        cellElement.dataset.index = index;
        cellElement.dataset.id = cell.id;
        
        // Set background color for heatmap mode
        cellElement.style.setProperty('--cell-color', cell.getColor());
        
        gridContainer.appendChild(cellElement);
    });
}

// ========================================
// UPDATE BATTERY GRID COLORS
// ========================================
function updateBatteryGrid() {
    const cells = document.querySelectorAll('.battery-cell');
    
    cells.forEach((cellElement, index) => {
        const cell = batteryData[index];
        
        // Remove all temp classes
        cellElement.className = 'battery-cell';
        
        // Add appropriate class
        cellElement.classList.add(cell.getTempClass());
        
        // Check for thermal cluster
        if (isThermalCluster(index)) {
            cellElement.classList.add('thermal-cluster');
        }
        
        // Update color for heatmap
        cellElement.style.setProperty('--cell-color', cell.getColor());
    });
    
    updateMetrics();
}

// ========================================
// ANOMALY DETECTION
// ========================================
function detectAnomalies() {
    const avgVoltage = batteryData.reduce((sum, cell) => sum + cell.voltage, 0) / batteryData.length;
    
    batteryData.forEach(cell => {
        // Reset anomaly status
        cell.anomalyStatus = 'NORMAL';
        
        // Temperature anomalies
        if (cell.temperature > CONFIG.TEMP_THRESHOLDS.CRITICAL) {
            cell.anomalyStatus = 'CRITICAL';
        } else if (cell.temperature > CONFIG.TEMP_THRESHOLDS.WARNING_MAX) {
            cell.anomalyStatus = 'WARNING';
        }
        
        // Voltage anomalies
        const voltageDeviation = Math.abs(cell.voltage - avgVoltage) / avgVoltage;
        if (voltageDeviation > CONFIG.VOLTAGE_DEVIATION) {
            if (cell.anomalyStatus === 'NORMAL') {
                cell.anomalyStatus = 'WARNING';
            }
        }
        
        // SoH anomalies
        if (cell.soh < CONFIG.SOH_CRITICAL) {
            cell.anomalyStatus = 'CRITICAL';
        }
    });
    
    updateAnomalyStatus();
}

// ========================================
// THERMAL CLUSTER DETECTION
// ========================================
function isThermalCluster(index) {
    const cell = batteryData[index];
    if (cell.temperature < CONFIG.TEMP_THRESHOLDS.ELEVATED_MAX) return false;
    
    const neighbors = getNeighbors(index);
    const hotNeighbors = neighbors.filter(n => 
        batteryData[n].temperature >= CONFIG.TEMP_THRESHOLDS.ELEVATED_MAX
    );
    
    // If 3 or more neighbors (including self) are hot, it's a cluster
    return hotNeighbors.length >= 2;
}

function getNeighbors(index) {
    const row = Math.floor(index / CONFIG.COLS);
    const col = index % CONFIG.COLS;
    const neighbors = [];
    
    // Check all 8 surrounding cells
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < CONFIG.ROWS && 
                newCol >= 0 && newCol < CONFIG.COLS) {
                neighbors.push(newRow * CONFIG.COLS + newCol);
            }
        }
    }
    
    return neighbors;
}

// ========================================
// UPDATE METRICS
// ========================================
function updateMetrics() {
    const temps = batteryData.map(cell => cell.temperature);
    const socs = batteryData.map(cell => cell.soc);
    const sohs = batteryData.map(cell => cell.soh);
    const voltages = batteryData.map(cell => cell.voltage);
    
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const avgSoc = socs.reduce((a, b) => a + b, 0) / socs.length;
    const avgSoh = sohs.reduce((a, b) => a + b, 0) / sohs.length;
    const totalVoltage = voltages.reduce((a, b) => a + b, 0);
    const totalCurrent = batteryData.reduce((sum, cell) => sum + cell.current, 0);
    
    const warningCells = batteryData.filter(cell => cell.anomalyStatus === 'WARNING').length;
    const faultyCells = batteryData.filter(cell => cell.anomalyStatus === 'CRITICAL').length;
    
    // Update DOM
    document.getElementById('avgTemp').textContent = avgTemp.toFixed(1) + '°C';
    document.getElementById('maxTemp').textContent = maxTemp.toFixed(1) + '°C';
    document.getElementById('minTemp').textContent = minTemp.toFixed(1) + '°C';
    document.getElementById('avgSoC').textContent = avgSoc.toFixed(1) + '%';
    document.getElementById('avgSoH').textContent = avgSoh.toFixed(1) + '%';
    document.getElementById('totalVoltage').textContent = totalVoltage.toFixed(1) + 'V';
    document.getElementById('totalCurrent').textContent = totalCurrent.toFixed(1) + 'A';
    document.getElementById('warningCells').textContent = warningCells;
    document.getElementById('faultyCells').textContent = faultyCells;
    
    // Update temperature history
    tempHistory.push({
        time: new Date().toLocaleTimeString(),
        avg: avgTemp,
        max: maxTemp,
        min: minTemp
    });
    
    if (tempHistory.length > 20) {
        tempHistory.shift();
    }
}

// ========================================
// UPDATE ANOMALY STATUS DISPLAY
// ========================================
function updateAnomalyStatus() {
    const statusElement = document.getElementById('anomalyStatus');
    const statusText = document.getElementById('statusText');
    
    const criticalCells = batteryData.filter(cell => cell.anomalyStatus === 'CRITICAL');
    const warningCells = batteryData.filter(cell => cell.anomalyStatus === 'WARNING');
    
    // Check for thermal clusters
    const clusterCells = batteryData.filter((_, index) => isThermalCluster(index));
    
    statusElement.className = 'anomaly-status';
    
    if (criticalCells.length > 0) {
        statusElement.classList.add('critical');
        if (clusterCells.length >= 3) {
            statusText.textContent = 'THERMAL CLUSTER DETECTED';
        } else {
            statusText.textContent = 'CRITICAL';
        }
    } else if (warningCells.length > 0) {
        statusElement.classList.add('warning');
        statusText.textContent = 'WARNING';
    } else {
        statusText.textContent = 'NORMAL';
    }
}

// ========================================
// INITIALIZE CHARTS
// ========================================
function initializeCharts() {
    // Temperature Chart
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    charts.tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Avg Temp',
                    data: [],
                    borderColor: '#22d3ee',
                    backgroundColor: 'rgba(34, 211, 238, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Max Temp',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#94a3b8', font: { size: 10 } }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#64748b', font: { size: 10 } },
                    grid: { color: 'rgba(71, 85, 105, 0.3)' }
                },
                x: {
                    ticks: { color: '#64748b', font: { size: 9 } },
                    grid: { color: 'rgba(71, 85, 105, 0.3)' }
                }
            }
        }
    });
    
    // SoH Distribution Chart
    const sohCtx = document.getElementById('sohChart').getContext('2d');
    charts.sohChart = new Chart(sohCtx, {
        type: 'bar',
        data: {
            labels: ['70-75%', '75-80%', '80-85%', '85-90%', '90-95%', '95-100%'],
            datasets: [{
                label: 'Cell Count',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(251, 191, 36, 0.7)',
                    'rgba(34, 211, 238, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(16, 185, 129, 0.9)'
                ],
                borderColor: [
                    '#ef4444',
                    '#fbbf24',
                    '#22d3ee',
                    '#10b981',
                    '#10b981',
                    '#10b981'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#64748b', font: { size: 10 } },
                    grid: { color: 'rgba(71, 85, 105, 0.3)' }
                },
                x: {
                    ticks: { color: '#64748b', font: { size: 9 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// ========================================
// UPDATE CHARTS
// ========================================
function updateCharts() {
    // Update temperature chart
    const labels = tempHistory.map(h => h.time);
    const avgData = tempHistory.map(h => h.avg);
    const maxData = tempHistory.map(h => h.max);
    
    charts.tempChart.data.labels = labels;
    charts.tempChart.data.datasets[0].data = avgData;
    charts.tempChart.data.datasets[1].data = maxData;
    charts.tempChart.update('none');
    
    // Update SoH distribution
    const sohCounts = [0, 0, 0, 0, 0, 0];
    batteryData.forEach(cell => {
        const soh = cell.soh;
        if (soh < 75) sohCounts[0]++;
        else if (soh < 80) sohCounts[1]++;
        else if (soh < 85) sohCounts[2]++;
        else if (soh < 90) sohCounts[3]++;
        else if (soh < 95) sohCounts[4]++;
        else sohCounts[5]++;
    });
    
    charts.sohChart.data.datasets[0].data = sohCounts;
    charts.sohChart.update('none');
}

// ========================================
// TOOLTIP HANDLING
// ========================================
function setupTooltip() {
    const tooltip = document.getElementById('tooltip');
    const gridContainer = document.getElementById('batteryGrid');
    
    gridContainer.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('battery-cell')) {
            const index = parseInt(e.target.dataset.index);
            const cell = batteryData[index];
            
            showTooltip(e.target, cell);
        }
    });
    
    gridContainer.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('battery-cell')) {
            hideTooltip();
        }
    });
}

function showTooltip(element, cell) {
    const tooltip = document.getElementById('tooltip');
    const rect = element.getBoundingClientRect();
    
    // Update tooltip content
    document.getElementById('tooltipTitle').textContent = cell.id;
    document.getElementById('tooltipStatus').textContent = cell.anomalyStatus;
    document.getElementById('tooltipTemp').textContent = cell.temperature.toFixed(2) + '°C';
    document.getElementById('tooltipVoltage').textContent = cell.voltage.toFixed(3) + 'V';
    document.getElementById('tooltipCurrent').textContent = cell.current.toFixed(2) + 'A';
    document.getElementById('tooltipSoC').textContent = cell.soc.toFixed(1) + '%';
    document.getElementById('tooltipSoH').textContent = cell.soh.toFixed(1) + '%';
    document.getElementById('tooltipResistance').textContent = cell.resistance.toFixed(2) + ' mΩ';
    document.getElementById('tooltipCycles').textContent = cell.cycles;
    
    // Color-code status
    const statusElement = document.getElementById('tooltipStatus');
    statusElement.style.background = 
        cell.anomalyStatus === 'CRITICAL' ? 'rgba(239, 68, 68, 0.8)' :
        cell.anomalyStatus === 'WARNING' ? 'rgba(251, 191, 36, 0.8)' :
        'rgba(16, 185, 129, 0.8)';
    
    // Position tooltip
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.top + 'px';
    
    // Show tooltip
    tooltip.classList.add('visible');
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.remove('visible');
}

// ========================================
// FAULT SIMULATION
// ========================================
function simulateFault() {
    const faultType = Math.random();
    
    if (faultType < 0.33) {
        // Isolated overheating cell
        const randomIndex = Math.floor(Math.random() * batteryData.length);
        batteryData[randomIndex].temperature = CONFIG.TEMP_THRESHOLDS.CRITICAL + Math.random() * 10;
        console.log(`🔥 Simulated isolated cell fault: ${batteryData[randomIndex].id}`);
    } else if (faultType < 0.66) {
        // Thermal cluster
        const centerIndex = Math.floor(Math.random() * batteryData.length);
        const neighbors = getNeighbors(centerIndex);
        
        batteryData[centerIndex].temperature = CONFIG.TEMP_THRESHOLDS.ELEVATED_MAX + Math.random() * 5;
        neighbors.slice(0, 3).forEach(n => {
            batteryData[n].temperature = CONFIG.TEMP_THRESHOLDS.ELEVATED_MAX + Math.random() * 5;
        });
        console.log(`🔥 Simulated thermal cluster around: ${batteryData[centerIndex].id}`);
    } else {
        // Voltage imbalance
        const randomIndex = Math.floor(Math.random() * batteryData.length);
        const avgVoltage = batteryData.reduce((sum, c) => sum + c.voltage, 0) / batteryData.length;
        batteryData[randomIndex].voltage = avgVoltage * (1 + CONFIG.VOLTAGE_DEVIATION + 0.05);
        console.log(`⚡ Simulated voltage imbalance: ${batteryData[randomIndex].id}`);
    }
}

function manualFaultSimulation() {
    console.log('🎯 Manual fault simulation triggered');
    simulateFault();
    updateBatteryGrid();
    detectAnomalies();
}

// ========================================
// UPDATE LOOP
// ========================================
function startUpdateLoop() {
    setInterval(() => {
        // Update all cells
        batteryData.forEach(cell => cell.update());
        
        // Detect anomalies
        detectAnomalies();
        
        // Update visuals
        updateBatteryGrid();
        updateCharts();
    }, CONFIG.UPDATE_INTERVAL);
}

function startFaultSimulation() {
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance every interval
            simulateFault();
        }
    }, CONFIG.FAULT_INTERVAL);
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Tooltip
    setupTooltip();
    
    // Simulate Fault Button
    document.getElementById('simulateFault').addEventListener('click', manualFaultSimulation);
    
    // Mode Toggle Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Change mode
            const mode = e.target.dataset.mode;
            currentMode = mode;
            
            const grid = document.getElementById('batteryGrid');
            grid.className = 'battery-grid';
            
            if (mode === 'heatmap') {
                grid.classList.add('heatmap-mode');
            } else if (mode === 'fault') {
                grid.classList.add('fault-mode');
            }
            
            console.log(`🔄 Switched to ${mode} mode`);
        });
    });
}

// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', initialize);