/**
 * Tipos para Bootstrap 5
 */

export interface ToastOptions {
  animation?: boolean;
  autohide?: boolean;
  delay?: number;
}

export interface ToastInstance {
  show(): void;
  hide(): void;
  dispose(): void;
}

export interface ToastStatic {
  new (element: Element, options?: ToastOptions): ToastInstance;
  getInstance(element: Element): ToastInstance | null;
  getOrCreateInstance(element: Element, options?: ToastOptions): ToastInstance;
}

export interface BootstrapStatic {
  Toast: ToastStatic;
  Modal: unknown;
  Popover: unknown;
  Tooltip: unknown;
  Alert: unknown;
  Carousel: unknown;
  Collapse: unknown;
  Dropdown: unknown;
  Offcanvas: unknown;
  Tab: unknown;
}

declare global {
  interface Window {
    bootstrap: BootstrapStatic;
  }
}
