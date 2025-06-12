import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiError } from '@domain/types/apiSchema';

describe('ApiError', () => {
  it('should create an error with default success value', () => {
    const error = new ApiError({
      message: 'Test error',
      data: { test: 'data' },
      status: 400,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: false,
    });

    expect(error.message).toBe('Test error');
    expect(error.data).toEqual({ test: 'data' });
    expect(error.status).toBe(400);
    expect(error.code).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.success).toBe(false);
  });

  it('should create an error with custom success value', () => {
    const error = new ApiError({
      message: 'Test success',
      data: { test: 'data' },
      status: 200,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: true,
    });

    expect(error.message).toBe('Test success');
    expect(error.data).toEqual({ test: 'data' });
    expect(error.status).toBe(200);
    expect(error.code).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.success).toBe(true);
  });

  it('should use default message when not provided', () => {
    const error = new ApiError({
      data: null,
      status: 400,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: false,
    });

    expect(error.message).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.data).toBeNull();
    expect(error.status).toBe(400);
    expect(error.code).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.success).toBe(false);
  });

  it('should use default message when message is undefined', () => {
    const error = new ApiError({
      message: undefined,
      data: null,
      status: 400,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: false,
    });

    expect(error.message).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.data).toBeNull();
    expect(error.status).toBe(400);
    expect(error.code).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.success).toBe(false);
  });
});
