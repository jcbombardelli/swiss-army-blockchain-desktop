/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Global Buffer declaration
declare global {
  interface Window {
    Buffer: typeof import('buffer').Buffer;
  }
  const Buffer: typeof import('buffer').Buffer;
}