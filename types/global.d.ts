// Global type declarations for testing and runtime augmentations

declare global {
  interface Window {
    originalConsoleLog?: typeof console.log;
    analyticsEvents?: any[];
  }
}

export {};
