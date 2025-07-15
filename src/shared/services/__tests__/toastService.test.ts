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
    toastService.show('Test custom message');

    expect(consoleLogSpy).toHaveBeenCalledWith('[TOAST] Test custom message');
  });

  it('debe proporcionar un método de inicialización', () => {
    expect(() => toastService.initialize()).not.toThrow();
  });
});
