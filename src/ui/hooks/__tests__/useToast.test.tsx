import { renderHook, act } from '@testing-library/react';

import { ToastProvider } from '@shared/services/ToastProvider';
import { useToast } from '@ui/hooks/useToast';

describe('useToast', () => {
  it('should allow showing a toast', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    );
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.info('Mensaje info', undefined, { type: 'Info' });
      result.current.success('Mensaje éxito', undefined, { type: 'Success' });
      result.current.warning('Mensaje warning', undefined, { type: 'Warning' });
      result.current.error('Mensaje error', undefined, { type: 'Danger' });
    });
  });
});
