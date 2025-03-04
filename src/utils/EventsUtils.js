/**
 * Created by charnjeetelectrovese@gmail.com on 11/13/2019.
 * Enhanced by ChatGPT on 2025-03-04.
 */

class EventUtils {
  constructor() {
    this.events = new Map();
  }

  // Predefined Events
  static EVENTS = {
    THROW_ERROR: 'THROW_ERROR',
    SHOW_SNACKBAR: 'SHOW_SNACKBAR',
    MOVE_TO_TOP: 'MOVE_TO_TOP',
  };

  /**
   * Dispatch an event, calling all listeners.
   * @param {string} event - The event name.
   * @param {*} data - Data to pass to the listeners.
   */
  dispatch(event, data) {
    if (!this.events.has(event)) return;
    this.events.get(event).forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event: ${event}`, error);
      }
    });
  }

  /**
   * Subscribe to an event.
   * @param {string} event - The event name.
   * @param {Function} callback - The function to execute when the event occurs.
   */
  subscribe(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
  }

  /**
   * Subscribe to an event once (auto-unsubscribes after execution).
   * @param {string} event - The event name.
   * @param {Function} callback - The function to execute once.
   */
  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.unsubscribe(event, wrapper); // Remove after first execution
    };
    this.subscribe(event, wrapper);
  }

  /**
   * Unsubscribe a specific listener from an event.
   * @param {string} event - The event name.
   * @param {Function} callback - The function to remove.
   */
  unsubscribe(event, callback) {
    if (!this.events.has(event)) return;
    const listeners = this.events.get(event);
    listeners.delete(callback);
    if (listeners.size === 0) {
      this.events.delete(event); // Remove empty event entries
    }
  }

  /**
   * Unsubscribe all listeners for a given event.
   * @param {string} event - The event name.
   */
  unsubscribeAll(event) {
    this.events.delete(event);
  }

  /**
   * Clear all events and listeners.
   */
  clear() {
    this.events.clear();
  }
}

// Singleton instance for global use
const eventBus = new EventUtils();
export default eventBus;
