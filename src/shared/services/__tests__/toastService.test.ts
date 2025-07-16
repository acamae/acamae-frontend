import { ToastOptions } from '@domain/types/toast';
import { toastService } from '@shared/services/toastService';

describe('toastService', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Espiar los métodos de console
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Restaurar los métodos de console
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('debe mostrar mensajes de error correctamente', () => {
    toastService.error('Test error message');

    expect(consoleErrorSpy).toHaveBeenCalledWith('[TOAST ERROR] Test error message');
  });

  it('debe mostrar mensajes de éxito correctamente', () => {
    toastService.success('Test success message');

    expect(consoleInfoSpy).toHaveBeenCalledWith('[TOAST SUCCESS] Test success message');
  });

  it('debe mostrar mensajes de advertencia correctamente', () => {
    toastService.warning('Test warning message');

    expect(consoleWarnSpy).toHaveBeenCalledWith('[TOAST WARNING] Test warning message');
  });

  it('debe mostrar mensajes informativos correctamente', () => {
    toastService.info('Test info message');

    expect(consoleInfoSpy).toHaveBeenCalledWith('[TOAST INFO] Test info message');
  });

  it('debe mostrar mensajes personalizados correctamente', () => {
    toastService.show({ message: 'Test custom message' });

    expect(consoleLogSpy).toHaveBeenCalledWith('[TOAST] Test custom message');
  });

  it('debe mostrar mensaje por defecto cuando no hay message en options', () => {
    toastService.show({} as ToastOptions);

    expect(consoleLogSpy).toHaveBeenCalledWith('[TOAST] Custom message');
  });

  describe('con toastApi configurado', () => {
    const mockToastApi = {
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
      show: jest.fn(),
    };

    beforeEach(() => {
      toastService.configure(mockToastApi);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('debe usar toastApi cuando está configurado', () => {
      toastService.error('Test error', 'Error Title');
      toastService.success('Test success', 'Success Title');
      toastService.warning('Test warning', 'Warning Title');
      toastService.info('Test info', 'Info Title');
      toastService.show({ message: 'Test show', type: 'Success' });

      expect(mockToastApi.error).toHaveBeenCalledWith('Test error', 'Error Title', undefined);
      expect(mockToastApi.success).toHaveBeenCalledWith('Test success', 'Success Title', undefined);
      expect(mockToastApi.warning).toHaveBeenCalledWith('Test warning', 'Warning Title', undefined);
      expect(mockToastApi.info).toHaveBeenCalledWith('Test info', 'Info Title', undefined);
      expect(mockToastApi.show).toHaveBeenCalledWith({ message: 'Test show', type: 'Success' });
    });
  });
});
