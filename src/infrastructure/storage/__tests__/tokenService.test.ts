import { jest } from '@jest/globals';

import { localStorageService } from '@infrastructure/storage/localStorageService';
import { tokenService } from '@infrastructure/storage/tokenService';

jest.mock('@infrastructure/storage/localStorageService', () => ({
  localStorageService: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('tokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('accessToken', () => {
    it('should get and set accessToken in memory', () => {
      // Inicialmente debe ser null
      expect(tokenService.getAccessToken()).toBeNull();

      // Debe almacenar y devolver el token
      tokenService.setAccessToken('test-access-token');
      expect(tokenService.getAccessToken()).toBe('test-access-token');

      // Debe permitir establecer el token a null
      tokenService.setAccessToken(null);
      expect(tokenService.getAccessToken()).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should get refreshToken from localStorage', () => {
      (localStorageService.get as jest.Mock).mockReturnValue('test-refresh-token');
      expect(tokenService.getRefreshToken()).toBe('test-refresh-token');
      expect(localStorageService.get).toHaveBeenCalledWith('__refreshToken__');
    });

    it('should set refreshToken in localStorage when value is provided', () => {
      tokenService.setRefreshToken('new-refresh-token');
      expect(localStorageService.set).toHaveBeenCalledWith('__refreshToken__', 'new-refresh-token');
    });

    it('should remove refreshToken from localStorage when null is provided', () => {
      tokenService.setRefreshToken(null);
      expect(localStorageService.remove).toHaveBeenCalledWith('__refreshToken__');
    });
  });

  describe('clear', () => {
    it('should clear both access and refresh tokens', () => {
      // Configurar un estado inicial con tokens
      tokenService.setAccessToken('test-access-token');
      (localStorageService.get as jest.Mock).mockReturnValue('test-refresh-token');

      // Verificar que los tokens existen
      expect(tokenService.getAccessToken()).toBe('test-access-token');
      expect(tokenService.getRefreshToken()).toBe('test-refresh-token');

      // Limpiar tokens
      tokenService.clear();

      // Verificar que el accessToken es null
      expect(tokenService.getAccessToken()).toBeNull();

      // Verificar que se llamó a remove para el refreshToken
      expect(localStorageService.remove).toHaveBeenCalledWith('__refreshToken__');
    });
  });
});
