import { localStorageService } from '../localStorageService';

describe('localStorageService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return null when key does not exist', () => {
      const result = localStorageService.get('nonExistentKey');
      expect(result).toBeNull();
    });

    it('should return the stored value when key exists', () => {
      const testKey = 'testKey';
      const testValue = 'testValue';
      window.localStorage.setItem(testKey, testValue);

      const result = localStorageService.get(testKey);
      expect(result).toBe(testValue);
    });
  });

  describe('set', () => {
    it('should store the value in localStorage', () => {
      const testKey = 'testKey';
      const testValue = 'testValue';

      localStorageService.set(testKey, testValue);
      const storedValue = window.localStorage.getItem(testKey);
      expect(storedValue).toBe(testValue);
    });

    it('should overwrite existing value', () => {
      const testKey = 'testKey';
      const initialValue = 'initialValue';
      const newValue = 'newValue';

      window.localStorage.setItem(testKey, initialValue);
      localStorageService.set(testKey, newValue);
      const storedValue = window.localStorage.getItem(testKey);
      expect(storedValue).toBe(newValue);
    });
  });

  describe('remove', () => {
    it('should remove the key from localStorage', () => {
      const testKey = 'testKey';
      const testValue = 'testValue';

      window.localStorage.setItem(testKey, testValue);
      localStorageService.remove(testKey);
      const storedValue = window.localStorage.getItem(testKey);
      expect(storedValue).toBeNull();
    });

    it('should do nothing when key does not exist', () => {
      expect(() => {
        localStorageService.remove('nonExistentKey');
      }).not.toThrow();
    });
  });
});
