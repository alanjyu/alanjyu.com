/**
 * Utility functions for knob controls
 */

/**
 * Update visual knob rotation based on input value
 * @param {HTMLInputElement} inputElement - The range input element
 */
export function updateKnobRotation(inputElement) {
    if (!inputElement || !inputElement.parentNode) return;
    
    const knobIndicator = inputElement.parentNode.querySelector('.knob-indicator');
    if (!knobIndicator) return;
    
    const min = parseFloat(inputElement.min) || 0;
    const max = parseFloat(inputElement.max) || 100;
    const value = parseFloat(inputElement.value) || 0;
    
    // Prevent division by zero
    if (max === min) return;
    
    // Calculate rotation (270 degrees total range, starting from -135 degrees)
    const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const rotation = -135 + (percentage * 270);
    
    knobIndicator.style.transform = `rotate(${rotation}deg)`;
}

/**
 * Initialize knob rotations for a set of input elements
 * @param {string|NodeList} selector - CSS selector or NodeList of input elements
 */
export function initKnobRotations(selector) {
    try {
        const inputs = typeof selector === 'string' 
            ? document.querySelectorAll(selector)
            : selector;
        
        if (!inputs || inputs.length === 0) return;
        
        inputs.forEach(input => updateKnobRotation(input));
    } catch (error) {
        console.warn('Error initializing knob rotations:', error);
    }
}

/**
 * Add knob rotation update to an input event listener
 * @param {HTMLInputElement} inputElement - The input element
 * @param {Function} callback - The original callback function
 * @returns {Function} - Enhanced callback that includes knob rotation
 */
export function withKnobRotation(inputElement, callback) {
    return function(event) {
        // Call the original callback
        const result = callback.call(this, event);
        
        // Update knob rotation
        updateKnobRotation(inputElement);
        
        return result;
    };
}

/**
 * Set up automatic knob rotation for input elements with knobs
 * @param {string} containerSelector - Selector for container element
 */
export function setupAutoKnobRotation(containerSelector = 'body') {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    // Find all range inputs with knob siblings
    const inputs = container.querySelectorAll('input[type="range"]');
    
    inputs.forEach(input => {
        const knob = input.parentNode.querySelector('.knob');
        if (!knob) return;
        
        // Initialize position
        updateKnobRotation(input);
        
        // Add rotation update to existing event listeners
        const originalHandler = input.oninput;
        input.addEventListener('input', () => {
            updateKnobRotation(input);
        });
    });
}