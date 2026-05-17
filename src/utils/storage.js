// Simple wrapper over localStorage for persistence
export const storage = {
  get: async (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (e) {
      console.warn("localStorage get failed", e);
      return null;
    }
  },
  set: async (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage set failed", e);
    }
  }
};
