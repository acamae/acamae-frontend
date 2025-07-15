import { logService } from '@shared/services/logService';

describe('logService', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Espiar los métodos de console
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Restaurar los métodos de console
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('debe registrar mensajes de error correctamente', () => {
    logService.error('Test error message', { details: 'error details' });

    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Test error message', {
      details: 'error details',
    });
  });

  it('debe registrar advertencias correctamente', () => {
    logService.warn('Test warning message', { details: 'warning details' });

    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Test warning message', {
      details: 'warning details',
    });
  });

  it('debe registrar mensajes informativos correctamente', () => {
    logService.info('Test info message', { details: 'info details' });

    expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Test info message', {
      details: 'info details',
    });
  });

  it('debe registrar mensajes generales correctamente', () => {
    logService.log('Test log message', { details: 'log details' });

    expect(consoleLogSpy).toHaveBeenCalledWith('[LOG] Test log message', {
      details: 'log details',
    });
  });
});
