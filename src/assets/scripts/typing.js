// Add this to the beginning of your typing.js file
const typingStyle = document.createElement('style');
typingStyle.textContent = `
    .will-type {
        visibility: hidden;
    }
    
    @keyframes cursor-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
    
    .typing-cursor {
        font-weight: bold;
        color: currentColor;
        margin-left: 2px;
    }
`;
document.head.appendChild(typingStyle);

class TypeEffect {
    constructor(element, text, options = {}) {
        this.element = element;
        this.fullText = text;
        this.currentText = '';
        this.index = 0;
        this.speed = options.speed || 50; // default typing speed
        this.delay = options.delay || 0;  // delay before starting
        this.waitAfter = options.waitAfter || 1000; // wait before starting callback
        this.loop = options.loop || false;
        this.callback = options.callback || null;
        this.cursorChar = options.cursorChar || '|';
        this.showCursor = options.showCursor !== false;
        this.removeCursorAfterTyping = options.removeCursorAfterTyping !== false; // New option
        
        this.cursor = null;
        
        if (this.showCursor) {
            this.cursor = document.createElement('span');
            this.cursor.className = 'typing-cursor';
            this.cursor.textContent = this.cursorChar;
            this.cursor.style.animation = 'cursor-blink 1s step-end infinite';
            this.element.appendChild(this.cursor);
        }
        
        setTimeout(() => this.type(), this.delay);
    }
    
    type() {
        if (this.index < this.fullText.length) {
            this.currentText += this.fullText.charAt(this.index);
            this.element.textContent = this.currentText;
            if (this.showCursor) {
                this.element.appendChild(this.cursor);
            }
            this.index++;
            setTimeout(() => this.type(), this.speed);
        } else {
            // Typing is complete
            if (this.removeCursorAfterTyping && this.cursor) {
                // Remove cursor after typing is complete
                this.cursor.remove();
            }
            
            if (this.callback) {
                setTimeout(() => this.callback(), this.waitAfter);
            } else if (this.loop) {
                setTimeout(() => this.reset(), this.waitAfter);
            }
        }
    }
    
    reset() {
        this.index = 0;
        this.currentText = '';
        this.type();
    }
}

// Add CSS for cursor blinking animation
const style = document.createElement('style');
style.textContent = `
    @keyframes cursor-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
    
    .typing-cursor {
        font-weight: bold;
        color: currentColor;
        margin-left: 2px;
    }
`;
document.head.appendChild(style);

// Helper function to easily initialize typing effects
function createTypingEffect(selector, options = {}) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) return null;
    
    // Add the hiding class immediately
    element.classList.add('will-type');
    
    const text = options.text || element.textContent;
    
    // Wait until DOMContentLoaded to ensure all styles are applied
    const initTyping = () => {
        // Save the text and clear the element
        element.textContent = '';
        // Make it visible again (but empty)
        element.classList.remove('will-type');
        // Start the typing effect
        return new TypeEffect(element, text, options);
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTyping);
    } else {
        initTyping();
    }
    
    return element;
}