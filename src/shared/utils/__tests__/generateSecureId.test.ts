import { generateSecureId } from '@shared/utils/generateSecureId';

// Constantes para valores reutilizables
const EXPECTED_ID_LENGTH = 9;
const MOCK_UUID = '12345678-1234-1234-1234-123456789012';
const MOCK_TIMESTAMP = 1234567890;

describe('generateSecureId', () => {
  // Verificación común para todos los IDs generados
  function verifyGeneratedId(id: string): void {
    expect(id).toHaveLength(EXPECTED_ID_LENGTH);
    expect(typeof id).toBe('string');
  }

  // Tests agrupados por caso de uso
  describe('cuando crypto.randomUUID está disponible', () => {
    it('debe usar randomUUID como método principal', () => {
      // Arrange - Mock de crypto con randomUUID
      const mockRandomUUID = jest.fn().mockReturnValue(MOCK_UUID);
      const mockCrypto = {
        randomUUID: mockRandomUUID,
        getRandomValues: jest.fn(),
        subtle: {} as SubtleCrypto,
      } as Partial<Crypto> as Crypto;

      // Act - Inyectar el mock de crypto
      const id = generateSecureId({
        cryptoObj: mockCrypto,
        dateNow: Date.now,
        processHrtime: undefined,
      });

      // Assert
      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
      expect(mockCrypto.getRandomValues).not.toHaveBeenCalled();
      verifyGeneratedId(id);
      // Verificar que el ID es una parte del UUID (primeros 9 caracteres sin guiones)
      expect(id).toBe(MOCK_UUID.replace(/-/g, '').substring(0, EXPECTED_ID_LENGTH));
    });
  });

  describe('cuando crypto.randomUUID no está disponible', () => {
    it('debe usar getRandomValues como fallback', () => {
      // Arrange - Mock de crypto sin randomUUID pero con getRandomValues
      const mockGetRandomValues = jest.fn((array: Uint8Array) => {
        // Llenar el array con valores deterministas
        for (let i = 0; i < array.length; i++) {
          array[i] = i + 1;
        }
        return array;
      });

      const mockCrypto = {
        randomUUID: undefined,
        getRandomValues: mockGetRandomValues,
        subtle: {} as SubtleCrypto,
      } as Partial<Crypto> as Crypto;

      // Act - Inyectar el mock de crypto
      const id = generateSecureId({
        cryptoObj: mockCrypto,
        dateNow: Date.now,
        processHrtime: undefined,
      });

      // Assert
      expect(mockGetRandomValues).toHaveBeenCalledTimes(1);
      expect(mockGetRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
      verifyGeneratedId(id);
    });
  });

  describe('cuando ninguna API crypto está disponible', () => {
    it('debe usar fallback basado en timestamp', () => {
      // Arrange - Mock de Date.now y crypto undefined
      const mockDateNow = jest.fn().mockReturnValue(MOCK_TIMESTAMP);

      // Act - Inyectar mocks
      const id = generateSecureId({
        cryptoObj: undefined,
        dateNow: mockDateNow,
        processHrtime: undefined,
      });

      // Assert
      expect(mockDateNow).toHaveBeenCalledTimes(1);
      verifyGeneratedId(id);
      // El ID debe ser los últimos 9 caracteres de `${MOCK_TIMESTAMP}_${MOCK_TIMESTAMP.toString(36)}`
      const expected = `${MOCK_TIMESTAMP}_${MOCK_TIMESTAMP.toString(36)}`.slice(
        -EXPECTED_ID_LENGTH
      );
      expect(id).toBe(expected);
    });
  });
});
