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
 * Set up double-click reset functionality for a knob
 * @param {HTMLInputElement} inputElement - The input element
 * @param {number} defaultValue - The default value to reset to
 * @param {Function} onReset - Optional callback when reset occurs
 */
export function setupKnobDoubleClickReset(inputElement, defaultValue, onReset) {
    if (!inputElement || !inputElement.parentNode) return;
    
    const knobContainer = inputElement.parentNode;
    
    knobContainer.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Reset to default value
        inputElement.value = defaultValue;
        
        // Update visual rotation
        updateKnobRotation(inputElement);
        
        // Trigger input event to update audio parameters
        const inputEvent = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(inputEvent);
        
        // Call optional reset callback
        if (onReset && typeof onReset === 'function') {
            onReset(defaultValue);
        }
    });
    
    // Add visual feedback for double-click capability
    knobContainer.style.cursor = 'pointer';
    knobContainer.title = `Double-click to reset to ${defaultValue}`;
}

/**
 * Set up vertical mouse drag functionality for a knob
 * @param {HTMLInputElement} inputElement - The input element
 * @param {Function} onDrag - Optional callback during drag
 */
export function setupKnobMouseDrag(inputElement, onDrag) {
    if (!inputElement || !inputElement.parentNode) return;
    
    const knobContainer = inputElement.parentNode;
    let isDragging = false;
    let startY = 0;
    let startValue = 0;
    let dragSensitivity = 0.5; // Adjust this to change drag sensitivity
    
    const onMouseDown = (e) => {
        if (e.detail === 2) return; // Ignore double-clicks (handled separately)
        
        e.preventDefault();
        e.stopPropagation();
        
        isDragging = true;
        startY = e.clientY;
        startValue = parseFloat(inputElement.value);
        
        // Add visual feedback
        knobContainer.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
        
        // Add global mouse listeners
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
    
    const onMouseMove = (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        
        const deltaY = startY - e.clientY; // Inverted: up = positive
        const min = parseFloat(inputElement.min) || 0;
        const max = parseFloat(inputElement.max) || 100;
        const range = max - min;
        
        // Calculate new value based on vertical movement
        const valueChange = (deltaY * dragSensitivity * range) / 100;
        let newValue = startValue + valueChange;
        
        // Clamp to min/max
        newValue = Math.max(min, Math.min(max, newValue));
        
        // Handle step attribute
        const step = parseFloat(inputElement.step) || 1;
        if (step !== 1) {
            newValue = Math.round(newValue / step) * step;
        }
        
        // Update input value
        inputElement.value = newValue;
        
        // Update visual rotation
        updateKnobRotation(inputElement);
        
        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(inputEvent);
        
        // Call optional drag callback
        if (onDrag && typeof onDrag === 'function') {
            onDrag(newValue);
        }
    };
    
    const onMouseUp = (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Reset cursor and selection
        knobContainer.style.cursor = 'pointer';
        document.body.style.userSelect = '';
        
        // Remove global listeners
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        e.preventDefault();
        e.stopPropagation();
    };
    
    // Add mouse down listener to knob container
    knobContainer.addEventListener('mousedown', onMouseDown);
    
    // Prevent default range input behavior
    inputElement.style.pointerEvents = 'none';
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

/**
 * Setup knobs with default values and double-click reset functionality
 * @param {Object} knobConfigs - Object mapping selector to config {defaultValue, onReset}
 */
export function setupKnobsWithDefaults(knobConfigs) {
    Object.entries(knobConfigs).forEach(([selector, config]) => {
        const inputElement = document.querySelector(selector);
        if (!inputElement) return;
        
        const { defaultValue, onReset, onDrag } = config;
        
        // Initialize rotation
        updateKnobRotation(inputElement);
        
        // Setup double-click reset
        setupKnobDoubleClickReset(inputElement, defaultValue, onReset);
        
        // Setup mouse drag
        setupKnobMouseDrag(inputElement, onDrag);
    });
}