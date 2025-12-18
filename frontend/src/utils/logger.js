/**
 * Conditional logger that only logs in development environment
 */

const isDevelopment = import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.MODE === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  // Special methods with emojis for better visibility
  auth: (...args) => {
    if (isDevelopment) {
      console.log('🔐', ...args);
    }
  },
  
  success: (...args) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  },
  
  failure: (...args) => {
    if (isDevelopment) {
      console.log('❌', ...args);
    }
  },
  
  loading: (...args) => {
    if (isDevelopment) {
      console.log('🔄', ...args);
    }
  },
  
  security: (...args) => {
    if (isDevelopment) {
      console.log('👮', ...args);
    }
  },
};

export default logger;
