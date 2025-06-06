import { localStorageService } from '../localStorageService';
import { sessionExpiryService } from '../sessionExpiryService';

jest.mock('../localStorageService');

describe('sessionExpiryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExpiresAt', () => {
    it('should return null when no expiry time is set', () => {
      (localStorageService.get as jest.Mock).mockReturnValue(null);

      const result = sessionExpiryService.getExpiresAt();
      expect(result).toBeNull();
      expect(localStorageService.get).toHaveBeenCalledWith('sessionExpiresAt');
    });

    it('should return the expiry time as a number', () => {
      const expiryTime = '1234567890';
      (localStorageService.get as jest.Mock).mockReturnValue(expiryTime);

      const result = sessionExpiryService.getExpiresAt();
      expect(result).toBe(Number(expiryTime));
      expect(localStorageService.get).toHaveBeenCalledWith('sessionExpiresAt');
    });
  });

  describe('setExpiresAt', () => {
    it('should store the expiry time as a string', () => {
      const expiryTime = 1234567890;

      sessionExpiryService.setExpiresAt(expiryTime);
      expect(localStorageService.set).toHaveBeenCalledWith(
        'sessionExpiresAt',
        expiryTime.toString()
      );
    });
  });

  describe('removeExpiresAt', () => {
    it('should remove the expiry time from storage', () => {
      sessionExpiryService.removeExpiresAt();
      expect(localStorageService.remove).toHaveBeenCalledWith('sessionExpiresAt');
    });
  });
});
