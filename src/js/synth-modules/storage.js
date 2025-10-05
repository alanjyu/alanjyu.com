export default class SynthStorage {
    constructor() {
        this.storageKey = 'synthSettings';
        
        // Define default values for all synth modules
        this.defaultSettings = {
            oscillator: {
                osc1: {
                    waveform: 'sawtooth',
                    volume: 50,
                    phase: 0
                },
                osc2: {
                    waveform: 'sine',
                    volume: 30,
                    detune: 0,
                    phase: 0
                }
            },
            filter: {
                enabled: false,
                type: 'none',
                frequency: 6000,
                resonance: 1,
                gain: 0,
                envelope: {
                    attack: 0.1,
                    decay: 0.2,
                    sustain: 0.7,
                    release: 0.3
                },
                lfo: {
                    enabled: false,
                    rate: 2,
                    depth: 100,
                    waveform: 'sine'
                }
            },
            effects: {
                reverb: {
                    enabled: false,
                    roomSize: 50,
                    damping: 50,
                    wetness: 30
                },
                delay: {
                    enabled: false,
                    time: 250,
                    feedback: 40,
                    wetness: 25
                }
            },
            keyboard: {
                velocity: 100,
                transpose: 0,
                octave: 4
            },
            display: {
                waveformColor: '#00ff88',
                backgroundColor: '#1a1a1a',
                gridEnabled: true
            },
            master: {
                volume: 75,
                pan: 0
            }
        };

        // Initialize settings
        this.currentSettings = this.loadSettings();
    }

    /**
     * Load settings from localStorage, fallback to defaults
     * @returns {Object} Complete settings object
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                // Merge with defaults to ensure all properties exist
                return this.mergeWithDefaults(parsedSettings);
            }
        } catch (error) {
            console.warn('Failed to load synth settings from localStorage:', error);
        }
        
        // Return deep copy of defaults
        return JSON.parse(JSON.stringify(this.defaultSettings));
    }

    /**
     * Save current settings to localStorage
     * @returns {boolean} Success status
     */
    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentSettings));
            return true;
        } catch (error) {
            console.error('Failed to save synth settings to localStorage:', error);
            return false;
        }
    }

    /**
     * Get all current settings
     * @returns {Object} Current settings object
     */
    getSettings() {
        return JSON.parse(JSON.stringify(this.currentSettings));
    }

    /**
     * Get settings for a specific module
     * @param {string} module - Module name (oscillator, effects, keyboard, display, master)
     * @returns {Object} Module settings
     */
    getModuleSettings(module) {
        return JSON.parse(JSON.stringify(this.currentSettings[module] || {}));
    }

    /**
     * Get default settings for a specific module
     * @param {string} module - Module name
     * @returns {Object} Default module settings
     */
    getDefaultModuleSettings(module) {
        return JSON.parse(JSON.stringify(this.defaultSettings[module] || {}));
    }

    /**
     * Update settings for a specific module
     * @param {string} module - Module name
     * @param {Object} newSettings - New settings to merge
     * @param {boolean} save - Whether to save to localStorage immediately
     * @returns {boolean} Success status
     */
    updateModuleSettings(module, newSettings, save = true) {
        if (!this.currentSettings[module]) {
            this.currentSettings[module] = {};
        }

        // Deep merge the new settings
        this.currentSettings[module] = this.deepMerge(this.currentSettings[module], newSettings);

        if (save) {
            return this.saveSettings();
        }
        return true;
    }

    /**
     * Update a specific setting value
     * @param {string} module - Module name
     * @param {string} setting - Setting path (e.g., 'osc1.waveform')
     * @param {*} value - New value
     * @param {boolean} save - Whether to save to localStorage immediately
     * @returns {boolean} Success status
     */
    updateSetting(module, setting, value, save = true) {
        if (!this.currentSettings[module]) {
            this.currentSettings[module] = {};
        }

        // Handle nested setting paths
        const path = setting.split('.');
        let target = this.currentSettings[module];
        
        // Navigate to the parent of the target property
        for (let i = 0; i < path.length - 1; i++) {
            if (!target[path[i]]) {
                target[path[i]] = {};
            }
            target = target[path[i]];
        }
        
        // Set the final value
        target[path[path.length - 1]] = value;

        if (save) {
            return this.saveSettings();
        }
        return true;
    }

    /**
     * Get a specific setting value
     * @param {string} module - Module name
     * @param {string} setting - Setting path (e.g., 'osc1.waveform')
     * @returns {*} Setting value or undefined
     */
    getSetting(module, setting) {
        if (!this.currentSettings[module]) {
            return undefined;
        }

        const path = setting.split('.');
        let target = this.currentSettings[module];
        
        for (const key of path) {
            if (target && typeof target === 'object' && key in target) {
                target = target[key];
            } else {
                return undefined;
            }
        }
        
        return target;
    }

    /**
     * Reset all settings to defaults
     * @param {boolean} save - Whether to save to localStorage immediately
     * @returns {boolean} Success status
     */
    resetToDefaults(save = true) {
        this.currentSettings = JSON.parse(JSON.stringify(this.defaultSettings));
        
        if (save) {
            return this.saveSettings();
        }
        return true;
    }

    /**
     * Reset a specific module to defaults
     * @param {string} module - Module name
     * @param {boolean} save - Whether to save to localStorage immediately
     * @returns {boolean} Success status
     */
    resetModuleToDefaults(module, save = true) {
        if (this.defaultSettings[module]) {
            this.currentSettings[module] = JSON.parse(JSON.stringify(this.defaultSettings[module]));
            
            if (save) {
                return this.saveSettings();
            }
        }
        return true;
    }

    /**
     * Export current settings as JSON string
     * @returns {string} JSON string of current settings
     */
    exportSettings() {
        return JSON.stringify(this.currentSettings, null, 2);
    }

    /**
     * Import settings from JSON string
     * @param {string} jsonString - JSON string of settings
     * @param {boolean} save - Whether to save to localStorage immediately
     * @returns {boolean} Success status
     */
    importSettings(jsonString, save = true) {
        try {
            const importedSettings = JSON.parse(jsonString);
            this.currentSettings = this.mergeWithDefaults(importedSettings);
            
            if (save) {
                return this.saveSettings();
            }
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }

    /**
     * Check if current settings differ from defaults
     * @returns {boolean} True if settings have been modified
     */
    hasCustomSettings() {
        return JSON.stringify(this.currentSettings) !== JSON.stringify(this.defaultSettings);
    }

    /**
     * Get list of modules that have been modified from defaults
     * @returns {Array<string>} Array of modified module names
     */
    getModifiedModules() {
        const modified = [];
        
        for (const module in this.defaultSettings) {
            if (JSON.stringify(this.currentSettings[module]) !== JSON.stringify(this.defaultSettings[module])) {
                modified.push(module);
            }
        }
        
        return modified;
    }

    /**
     * Get filter-specific settings
     * @returns {Object} Filter settings object
     */
    getFilterSettings() {
        return JSON.parse(JSON.stringify(this.currentSettings.filter || {}));
    }

    /**
     * Update filter settings
     * @param {Object} newSettings - New filter settings to merge
     * @param {boolean} save - Whether to save to localStorage immediately
     * @returns {boolean} Success status
     */
    updateFilterSettings(newSettings, save = true) {
        return this.updateModuleSettings('filter', newSettings, save);
    }

    /**
     * Get a specific filter setting
     * @param {string} setting - Setting path (e.g., 'envelope.attack')
     * @returns {*} Setting value or undefined
     */
    getFilterSetting(setting) {
        return this.getSetting('filter', setting);
    }

    /**
     * Update a specific filter setting
     * @param {string} setting - Setting path (e.g., 'envelope.attack')
     * @param {*} value - New value
     * @param {boolean} save - Whether to save to localStorage immediately
     * @returns {boolean} Success status
     */
    updateFilterSetting(setting, value, save = true) {
        return this.updateSetting('filter', setting, value, save);
    }

    /**
     * Reset filter to default settings
     * @param {boolean} save - Whether to save to localStorage immediately
     * @returns {boolean} Success status
     */
    resetFilterToDefaults(save = true) {
        return this.resetModuleToDefaults('filter', save);
    }

    /**
     * Check if filter settings have been modified from defaults
     * @returns {boolean} True if filter settings have been modified
     */
    hasCustomFilterSettings() {
        return JSON.stringify(this.currentSettings.filter) !== JSON.stringify(this.defaultSettings.filter);
    }

    /**
     * Deep merge two objects
     * @private
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Merge saved settings with defaults to ensure all properties exist
     * @private
     */
    mergeWithDefaults(savedSettings) {
        return this.deepMerge(this.defaultSettings, savedSettings);
    }
}

// Create and export a singleton instance
export const synthStorage = new SynthStorage();