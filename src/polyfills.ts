// Polyfills for Node.js modules in browser environment
import { Buffer } from 'buffer';

// Define global if it doesn't exist
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

// Make Buffer available globally in all possible contexts
const setGlobalBuffer = (obj: any) => {
  if (obj && typeof obj === 'object') {
    try {
      obj.Buffer = Buffer;
    } catch (e) {
      console.warn('Could not set Buffer on object:', e);
    }
  }
};

// Set Buffer in all global contexts
try {
  setGlobalBuffer(globalThis);
  setGlobalBuffer(window);
  if (typeof global !== 'undefined') {
    setGlobalBuffer(global);
  }
  setGlobalBuffer(self);
} catch (e) {
  console.warn('Error setting global Buffer:', e);
}

// Also set it as a simple global variable
try {
  (globalThis as any).Buffer = Buffer;
} catch (e) {
  console.warn('Error setting globalThis.Buffer:', e);
}

// Ensure process is defined for some libraries
if (typeof globalThis !== 'undefined') {
  try {
    (globalThis as any).process = (globalThis as any).process || {
      env: {},
      browser: true,
      version: '',
      versions: {},
    };
  } catch (e) {
    console.warn('Error setting process:', e);
  }
}

console.log('Polyfills loaded successfully');
console.log('Buffer available:', typeof Buffer !== 'undefined');
console.log('globalThis.Buffer:', typeof (globalThis as any).Buffer);
console.log('window.Buffer:', typeof (window as any).Buffer);
