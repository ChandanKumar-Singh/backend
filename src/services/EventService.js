import Constants from "../config/constants.js";

class EventUtils {
    constructor() {
        this.enabled = Constants.Events.Enabled || false;
        this.events = {}; // Stores event listeners
    }

    // ✅ Subscribe to an event
    on(event, listener) {
        if (!this.enabled) return;
        if (!this.events[event]) {
            this.events[event] = [];
        }

        // Prevent duplicate listeners
        if (!this.events[event].includes(listener)) {
            this.events[event].push(listener);
        }
    }

    // ✅ Subscribe to an event only once
    once(event, listener) {
        if (!this.enabled) return;

        const wrapper = (data) => {
            listener(data);
            this.off(event, wrapper); // Auto-remove listener
        };

        this.on(event, wrapper);
    }

    // ✅ Dispatch (Emit) an event
    async emit(event, data) {
        if (!this.enabled || !this.events[event]) return;

        // Execute all listeners (supports async functions)
        await Promise.all(this.events[event].map(listener => listener(data)));
    }

    // ✅ Unsubscribe from an event
    off(event, listener) {
        if (!this.enabled || !this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }
}

export default new EventUtils();
