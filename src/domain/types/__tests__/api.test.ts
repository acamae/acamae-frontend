import { ApiSuccessCodes, ApiErrorCodes } from '@domain/types/api';

describe('API Types', () => {
  describe('ApiSuccessCodes', () => {
    it('debe contener los códigos de éxito correctos', () => {
      expect(ApiSuccessCodes.SUCCESS).toBe(200);
      expect(ApiSuccessCodes.CREATED).toBe(201);
      expect(ApiSuccessCodes.ACCEPTED).toBe(202);
      expect(ApiSuccessCodes.NO_CONTENT).toBe(204);
    });
  });

  describe('ApiErrorCodes', () => {
    it('debe contener los códigos de error correctos', () => {
      expect(ApiErrorCodes.BAD_REQUEST).toBe(400);
      expect(ApiErrorCodes.UNAUTHORIZED).toBe(401);
      expect(ApiErrorCodes.FORBIDDEN).toBe(403);
      expect(ApiErrorCodes.NOT_FOUND).toBe(404);
      expect(ApiErrorCodes.CONFLICT).toBe(409);
      expect(ApiErrorCodes.UNPROCESSABLE_ENTITY).toBe(422);
      expect(ApiErrorCodes.TOO_MANY_REQUESTS).toBe(429);
      expect(ApiErrorCodes.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });
});
