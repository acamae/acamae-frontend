export type ToastType =
  | 'Primary'
  | 'Secondary'
  | 'Success'
  | 'Danger'
  | 'Warning'
  | 'Info'
  | 'Dark';

export interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  autohide?: boolean;
  position?:
    | 'top-start'
    | 'top-center'
    | 'top-end'
    | 'middle-start'
    | 'middle-center'
    | 'middle-end'
    | 'bottom-start'
    | 'bottom-center'
    | 'bottom-end';
}
