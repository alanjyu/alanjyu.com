/**
 * Filter Module - Handles audio filtering with lowpass, highpass, and bandpass options
 */
import { updateKnobRotation, setupKnobsWithDefaults } from './knobs.js';
import { synthStorage } from './storage.js';

export default class Filter {
    constructor(audioContext, inputNode, outputNode) {
        this.audioContext = audioContext;
        this.inputNode = inputNode;
        this.outputNode = outputNode;
        this.storage = synthStorage;
        
        // Load settings from storage
        this.loadSettings();
        
        // Create filter node
        this.filterNode = this.audioContext.createBiquadFilter();
        this.updateFilter();
        
        // Connect audio chain
        this.connectFilter();
        
        // Initialize visualization
        this.initVisualization();
        
        // Initialize UI
        this.initUI();
    }
    
    /**
     * Load settings from storage
     */
    loadSettings() {
        const savedSettings = this.storage.getModuleSettings('effects');
        const filterSettings = savedSettings.filter || {};
        
        this.settings = {
            type: filterSettings.type || 'none',
            frequency: filterSettings.frequency || 1000,
            resonance: filterSettings.resonance || 1,
            enabled: filterSettings.type !== 'none' && filterSettings.type !== undefined
        };
    }
    
    /**
     * Initialize filter frequency response visualization
     */
    initVisualization() {
        this.canvas = document.getElementById('filter-response');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.startVisualization();
    }
    
    /**
     * Setup canvas dimensions and properties
     */
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    /**
     * Start the visualization animation loop
     */
    startVisualization() {
        // Draw initial state
        this.drawFilterResponse();
        // No need for interval since we update manually on parameter changes
    }
    
    /**
     * Draw the filter frequency response curve
     */
    drawFilterResponse() {
        if (!this.ctx) return;
        
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw grid lines
        this.drawGrid(width, height);
        
        // Draw frequency response curve
        this.drawResponseCurve(width, height);
        
        // Draw current frequency marker
        this.drawFrequencyMarker(width, height);
    }
    
    /**
     * Draw background grid
     */
    drawGrid(width, height) {
        this.ctx.strokeStyle = 'rgba(255, 165, 0, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines (dB levels)
        for (let i = 0; i <= 4; i++) {
            const y = (i / 4) * height;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        // Vertical lines (frequency markers)
        for (let i = 0; i <= 8; i++) {
            const x = (i / 8) * width;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw the filter response curve
     */
    drawResponseCurve(width, height) {
        if (this.settings.type === 'none') {
            // Draw flat line for no filter
            this.ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, height / 2);
            this.ctx.lineTo(width, height / 2);
            this.ctx.stroke();
            return;
        }
        
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const nyquist = this.audioContext.sampleRate / 2;
        const minFreq = 20;
        const maxFreq = nyquist;
        
        for (let i = 0; i < width; i++) {
            const x = i;
            const freq = minFreq * Math.pow(maxFreq / minFreq, i / width);
            const response = this.calculateFilterResponse(freq);
            const y = height - (response * height);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Calculate filter response at a given frequency
     */
    calculateFilterResponse(frequency) {
        if (this.settings.type === 'none') return 0.5;
        
        const f = frequency;
        const fc = this.settings.frequency;
        const Q = this.settings.resonance;
        
        let magnitude;
        
        switch (this.settings.type) {
            case 'lowpass':
                // Standard 2nd-order lowpass: gentle rolloff above cutoff
                const ratio_lp = f / fc;
                magnitude = 1 / Math.sqrt(1 + Math.pow(ratio_lp, 2 * Q));
                break;
                
            case 'highpass':
                // Standard 2nd-order highpass: gentle rolloff below cutoff (mirror of lowpass)
                const ratio_hp = f / fc;
                magnitude = Math.pow(ratio_hp, Q) / Math.sqrt(1 + Math.pow(ratio_hp, 2 * Q));
                break;
                
            case 'bandpass':
                // Bandpass: peaked at fc, gentle rolloff on both sides
                const ratio_bp = f / fc;
                magnitude = 1 / (1 + Math.pow(Q * (ratio_bp - 1/ratio_bp), 2));
                break;
                
            default:
                magnitude = 0.5;
        }
        
        // Normalize to 0-1 range for display
        return Math.max(0, Math.min(1, magnitude));
    }
    
    /**
     * Draw frequency marker at current filter frequency
     */
    drawFrequencyMarker(width, height) {
        if (this.settings.type === 'none') return;
        
        const minFreq = 20;
        const maxFreq = this.audioContext.sampleRate / 2;
        const x = width * Math.log(this.settings.frequency / minFreq) / Math.log(maxFreq / minFreq);
        
        // Draw vertical line
        this.ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw frequency label
        this.ctx.fillStyle = '#FFA500';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        const freqLabel = this.settings.frequency >= 1000 ? 
            `${(this.settings.frequency / 1000).toFixed(1)}k` : 
            `${Math.round(this.settings.frequency)}`;
        this.ctx.fillText(freqLabel, x, 12);
    }
    
    /**
     * Connect the filter in the audio chain
     */
    connectFilter() {
        // Disconnect existing connections
        try {
            this.inputNode.disconnect();
            if (this.filterNode) this.filterNode.disconnect();
        } catch (e) {
            // Ignore disconnection errors
        }
        
        if (this.settings.enabled && this.settings.type !== 'none') {
            // Use filter when enabled and type is not 'none'
            this.inputNode.connect(this.filterNode);
            this.filterNode.connect(this.outputNode);
        } else {
            // Bypass filter when disabled or type is 'none'
            this.inputNode.connect(this.outputNode);
        }
    }
    
    /**
     * Update filter parameters
     */
    updateFilter() {
        if (this.filterNode && this.settings.type !== 'none') {
            this.filterNode.type = this.settings.type;
            this.filterNode.frequency.setValueAtTime(
                this.settings.frequency, 
                this.audioContext.currentTime
            );
            this.filterNode.Q.setValueAtTime(
                this.settings.resonance, 
                this.audioContext.currentTime
            );
        }
        
        // Reconnect audio chain
        this.connectFilter();
        
        // Update visualization immediately
        if (this.ctx) {
            this.drawFilterResponse();
        }
    }
    
    /**
     * Initialize UI controls
     */
    initUI() {
        this.setupFilterTypeButtons();
        this.setupFrequencyControl();
        this.setupResonanceControl();
        this.setupKnobDefaults();
        this.loadUIState();
    }
    
    /**
     * Setup knobs with default values and double-click reset functionality
     */
    setupKnobDefaults() {
        const knobConfigs = {
            '#filter-frequency': {
                defaultValue: this.settings.frequency,
                onReset: (value) => {
                    this.updateFrequency(value);
                    this.updateFrequencyDisplay(value);
                }
            },
            '#filter-resonance': {
                defaultValue: this.settings.resonance,
                onReset: (value) => {
                    this.updateResonance(value);
                    this.updateResonanceDisplay(value);
                }
            }
        };
        
        setupKnobsWithDefaults(knobConfigs);
    }
    
    /**
     * Setup filter type buttons
     */
    setupFilterTypeButtons() {
        const filterButtons = document.querySelectorAll('.filter-types__button');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const filterType = e.currentTarget.dataset.filter;
                
                // Remove selected class from all filter buttons
                filterButtons.forEach(btn => btn.classList.remove('selected'));
                
                // Add selected class to clicked button
                e.currentTarget.classList.add('selected');
                
                // Update filter type and settings
                this.updateFilterType(filterType);
            });
        });
    }
    
    /**
     * Setup frequency control
     */
    setupFrequencyControl() {
        const frequencyControl = document.getElementById('filter-frequency');
        
        frequencyControl?.addEventListener('input', (e) => {
            const frequency = parseFloat(e.target.value);
            this.updateFrequency(frequency);
            this.updateFrequencyDisplay(frequency);
            updateKnobRotation(e.target);
            
            // Update visualization immediately
            if (this.ctx) {
                this.drawFilterResponse();
            }
        });
    }
    
    /**
     * Setup resonance control
     */
    setupResonanceControl() {
        const resonanceControl = document.getElementById('filter-resonance');
        
        resonanceControl?.addEventListener('input', (e) => {
            const resonance = parseFloat(e.target.value);
            this.updateResonance(resonance);
            this.updateResonanceDisplay(resonance);
            updateKnobRotation(e.target);
            
            // Update visualization immediately
            if (this.ctx) {
                this.drawFilterResponse();
            }
        });
    }
    
    /**
     * Update filter type
     */
    updateFilterType(type) {
        this.settings.type = type;
        this.settings.enabled = type !== 'none';
        this.storage.updateSetting('effects', 'filter.type', type);
        this.updateFilter();
    }
    
    /**
     * Update filter frequency
     */
    updateFrequency(frequency) {
        this.settings.frequency = frequency;
        this.storage.updateSetting('effects', 'filter.frequency', frequency);
        this.updateFilter();
    }
    
    /**
     * Update filter resonance
     */
    updateResonance(resonance) {
        this.settings.resonance = resonance;
        this.storage.updateSetting('effects', 'filter.resonance', resonance);
        this.updateFilter();
    }
    
    /**
     * Update frequency display
     */
    updateFrequencyDisplay(frequency) {
        const display = document.querySelector('.frequency-display');
        if (display) {
            if (frequency >= 1000) {
                const kHz = (frequency / 1000).toFixed(1);
                display.textContent = `${kHz}kHz`;
            } else {
                display.textContent = `${Math.round(frequency)}Hz`;
            }
        }
    }
    
    /**
     * Update resonance display
     */
    updateResonanceDisplay(resonance) {
        const display = document.querySelector('.resonance-display');
        if (display) {
            display.textContent = resonance.toFixed(1);
        }
    }
    
    /**
     * Load UI state from current settings
     */
    loadUIState() {
        // Update filter type buttons
        document.querySelectorAll('.filter-types__button').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.filter === this.settings.type);
        });
        
        // Update sliders and displays
        const frequencyControl = document.getElementById('filter-frequency');
        const resonanceControl = document.getElementById('filter-resonance');
        
        if (frequencyControl) {
            frequencyControl.value = this.settings.frequency;
            this.updateFrequencyDisplay(this.settings.frequency);
            updateKnobRotation(frequencyControl);
        }
        
        if (resonanceControl) {
            resonanceControl.value = this.settings.resonance;
            this.updateResonanceDisplay(this.settings.resonance);
            updateKnobRotation(resonanceControl);
        }
        
        // Update visualization to match current settings
        if (this.ctx) {
            this.drawFilterResponse();
        }
    }
    
    /**
     * Reset filter to default settings
     */
    resetToDefaults() {
        const defaultSettings = this.storage.getDefaultModuleSettings('effects');
        const defaultFilter = defaultSettings.filter || {};
        
        this.settings = {
            type: defaultFilter.type || 'none',
            frequency: defaultFilter.frequency || 1000,
            resonance: defaultFilter.resonance || 1,
            enabled: (defaultFilter.type || 'none') !== 'none'
        };
        
        // Save to storage
        this.storage.updateSetting('effects', 'filter.type', this.settings.type);
        this.storage.updateSetting('effects', 'filter.frequency', this.settings.frequency);
        this.storage.updateSetting('effects', 'filter.resonance', this.settings.resonance);
        
        this.updateFilter();
        this.loadUIState();
    }
    
    /**
     * Get current filter settings
     */
    getSettings() {
        return { ...this.settings };
    }
    
    /**
     * Set filter settings
     */
    setSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.updateFilter();
        this.loadUIState();
    }
    
    /**
     * Cleanup visualization resources
     */
    destroy() {
        if (this.visualizationInterval) {
            clearInterval(this.visualizationInterval);
        }
    }
}