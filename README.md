# FLEET-LEVEL Battery Performance Dashboard

## Overview

**THERMASCAN** is an advanced EV Battery Digital Twin & Anomaly Intelligence System that provides real-time spatial intelligence and predictive monitoring for electric vehicle battery packs. The dashboard enables fleet operators and battery engineers to monitor, analyze, and diagnose battery health with precision and real-time insights.

## Features

### Core Monitoring Capabilities
- **Real-Time Battery Pack Monitoring**: Visualize all 96 cells in an 8×12 grid layout with live metrics
- **Temperature Tracking**: Continuous monitoring of cell temperatures with visual heatmaps
- **State of Charge (SoC) & State of Health (SoH)**: Real-time aggregated metrics across the pack
- **Voltage & Current Monitoring**: Individual cell voltage and current measurements
- **Cycle Tracking**: Monitor the number of charge/discharge cycles for each cell

### Intelligent Analytics
- **Anomaly Detection**: Automatic detection of faulty and warning cells
- **Temperature Trend Analysis**: Historical temperature charts to identify patterns
- **SoH Distribution**: Visual distribution of battery health across the pack
- **Fault Simulation**: Test anomaly detection and response systems

### Visualization Modes
- **Normal Mode**: Standard dashboard view with all metrics
- **Heatmap Mode**: Color-coded cell visualization based on temperature
- **Fault Focus Mode**: Highlight problematic cells for quick diagnostics

### Historical Data
- Dynamic temperature charts with 60-second historical window
- Real-time updates every 2 seconds

## Technical Specifications

### Battery Cell Parameters
- **Temperature Range**: 20°C - 60°C
- **Voltage Range**: 3.0V - 4.2V
- **SoC Range**: 0% - 100%
- **SoH Range**: 0% - 100%
- **Resistance**: 1 - 5 mΩ
- **Cycles**: 0 - 2000+

### Configuration Constants
- Grid Dimensions: 8 rows × 12 columns
- Total Cells: 96
- Update Interval: 2 seconds
- Fault Simulation Interval: 3 seconds

### Temperature Thresholds
| Status | Range |
|--------|-------|
| Cool | < 28°C |
| Normal | 28°C - 40°C |
| Elevated | 40°C - 45°C |
| Warning | 45°C - 55°C |
| Critical | > 55°C |

## Usage

### Getting Started
1. Open `index.html` in a modern web browser
2. The dashboard will auto-initialize with simulated battery data
3. Monitor real-time metrics in the left sidebar

### Dashboard Components

#### Metrics Panel (Left Sidebar)
- **Pack Metrics**: Global statistics including average/max/min temperatures
- **Anomaly Status**: Current system health indicator
- **Temperature Trend Chart**: Visual representation of temperature history
- **SoH Distribution Chart**: Battery health distribution across cells
- **Control Buttons**: Simulation and mode selection

#### Battery Pack Grid (Main View)
- Visual grid representation of all 96 battery cells
- Color-coded cells based on temperature (cool blue to hot red)
- Cell hover information showing detailed metrics
- Real-time updating status

### Controls
- **Simulate Fault Button**: Trigger anomaly scenarios for testing
- **Mode Toggle Buttons**: Switch between visualization modes
  - Normal: Default comprehensive view
  - Heatmap: Temperature-based visualization
  - Fault Focus: Emphasis on problematic cells

## Installation

No external dependencies required beyond the HTML, CSS, and JavaScript files. The application uses:
- **Chart.js 4.4.0**: For chart rendering (loaded via CDN)
- Vanilla JavaScript: For data processing and visualization
- CSS3: For styling and animations

### Browser Requirements
- Modern browsers with ES6 support
- Canvas API support for charts
- Recommended: Chrome, Firefox, Safari, Edge (latest versions)

## File Structure

```
.
├── index.html       # Main HTML structure and layout
├── script.js        # Core logic, data processing, and interactions
├── styles.css       # Styling with dark theme and animations
└── README.md        # This file
```

## Application Architecture

### JavaScript Classes & Functions

#### BatteryCell Class
Represents individual battery cells with properties:
- Temperature, voltage, current
- State of Charge (SoC), State of Health (SoH)
- Resistance and cycle count
- Anomaly status tracking

#### Core Functions
- `initialize()`: Set up dashboard and data
- `generateBatteryData()`: Create battery cell instances
- `renderBatteryGrid()`: Render visual grid
- `updateMetrics()`: Refresh displayed metrics
- `updateCharts()`: Refresh chart data
- `checkAnomalies()`: Detect faulty cells
- `simulateFault()`: Inject fault scenarios

## Metrics Explanation

### SoC (State of Charge)
The current energy level in the battery as a percentage (0-100%)

### SoH (State of Health)
The overall health condition of the battery indicating capacity retention (0-100%)

### Voltage Deviation
Individual cell voltage variance from the pack average (threshold: 10%)

### Average Temperature
Mean temperature across all battery cells

### Total Voltage & Current
Aggregated values from the entire battery pack

## Color Coding

- **Blue**: Cool cells (< 28°C) - Optimal operating temperature
- **Green**: Normal cells (28-40°C) - Expected operating range
- **Yellow**: Elevated cells (40-45°C) - Monitor closely
- **Orange**: Warning cells (45-55°C) - Requires attention
- **Red**: Critical cells (> 55°C) - Immediate action needed

## Features & Capabilities

### Real-Time Updates
- Automatic data refresh every 2 seconds
- Live metric calculations and status updates
- Smooth animations and transitions

### Fault Detection
- Automatic identification of anomalous cells
- Voltage deviation monitoring
- SoH degradation tracking
- Temperature threshold violations

### User Interface
- Dark theme with neon accents for reduced eye strain
- Responsive grid layout
- Sticky sidebar for constant access to metrics
- Interactive cell information on hover

## Future Enhancements

Potential additions could include:
- Historical data logging and export
- Predictive maintenance algorithms
- Advanced ML-based anomaly detection
- Multi-pack fleet comparison
- Real vehicle integration APIs
- Alert notification system
- Custom threshold configuration

## License

This application is part of the FLEET-LEVEL battery monitoring ecosystem.

## Support

For issues, feature requests, or technical questions, please refer to the application's technical documentation or contact the development team.

---

**THERMASCAN** - Digital Twin Technology for EV Battery Management  
*Real-Time Spatial Intelligence & Predictive Monitoring*
