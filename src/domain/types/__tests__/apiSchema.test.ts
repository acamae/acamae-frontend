import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiError } from '@domain/types/apiSchema';

describe('ApiError', () => {
  // Helper function to create test response objects bypassing strict typing
  const createTestResponse = (message: unknown) => ({
    message,
    data: null,
    code: ApiErrorCodes.UNKNOWN_ERROR,
    success: false,
    timestamp: new Date().toISOString(),
    requestId: 'req_test_123',
  });

  it('should create an error with all properties', () => {
    const error = new ApiError({
      message: 'Test error message',
      data: { test: 'data' },
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: false,
      timestamp: new Date().toISOString(),
      requestId: 'req_test_123',
    });

    expect(error.message).toBe('Test error message');
    expect(error.data).toEqual({ test: 'data' });
    expect(error.code).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.success).toBe(false);
  });

  it('should create an error from success response', () => {
    const error = new ApiError({
      message: 'Success message treated as error',
      data: { test: 'data' },
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: true,
      timestamp: new Date().toISOString(),
      requestId: 'req_test_456',
    });

    expect(error.message).toBe('Success message treated as error');
    expect(error.data).toEqual({ test: 'data' });
    expect(error.success).toBe(true);
  });

  it('should use default error code when message is empty', () => {
    const error = new ApiError({
      message: '',
      data: null,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: false,
      timestamp: new Date().toISOString(),
      requestId: 'req_test_789',
    });

    expect(error.message).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.data).toBe(null);
    expect(error.success).toBe(false);
  });

  it('should use default error code when message is whitespace', () => {
    const error = new ApiError({
      message: '   ',
      data: null,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: false,
      timestamp: new Date().toISOString(),
      requestId: 'req_test_abc',
    });

    expect(error.message).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.data).toBe(null);
    expect(error.success).toBe(false);
  });

  it('should use default error code when message is null', () => {
    // Test runtime behavior with null message
    const response = createTestResponse(null);
    // @ts-ignore - Testing runtime behavior with invalid types
    const error = new ApiError(response);

    expect(error.message).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.data).toBe(null);
    expect(error.success).toBe(false);
  });

  it('should use default error code when message is undefined', () => {
    // Test runtime behavior with undefined message
    const response = createTestResponse(undefined);
    // @ts-ignore - Testing runtime behavior with invalid types
    const error = new ApiError(response);

    expect(error.message).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.data).toBe(null);
    expect(error.success).toBe(false);
  });

  it('should use default error code when message contains only special whitespace', () => {
    // Test with special whitespace characters (tabs, newlines, etc.)
    const error = new ApiError({
      message: '\t\n\r ',
      data: null,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: false,
      timestamp: new Date().toISOString(),
      requestId: 'req_test_special',
    });

    expect(error.message).toBe(ApiErrorCodes.UNKNOWN_ERROR);
    expect(error.data).toBe(null);
    expect(error.success).toBe(false);
  });

  it('should handle message with valid content after trim', () => {
    // Test message that has content after trimming
    const error = new ApiError({
      message: '  Valid Message  ',
      data: null,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: false,
      timestamp: new Date().toISOString(),
      requestId: 'req_test_trim',
    });

    expect(error.message).toBe('  Valid Message  ');
    expect(error.data).toBe(null);
    expect(error.success).toBe(false);
  });

  it('should use original message value when trim() returns truthy', () => {
    // Explicitly test the ternary true branch: when message?.trim() is truthy, use original message
    const originalMessage = '  Has Content  ';
    const error = new ApiError({
      message: originalMessage,
      data: null,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: false,
      timestamp: new Date().toISOString(),
      requestId: 'req_test_original',
    });

    // Should use original message (with spaces), not trimmed version
    expect(error.message).toBe(originalMessage);
    expect(error.message).toBe('  Has Content  ');
    expect(error.message).not.toBe('Has Content'); // Not the trimmed version
  });

  it('should handle falsy result from trim method', () => {
    // Test specific case where message exists but trim() returns empty string
    const error = new ApiError({
      message: '\u00A0\u2000\u2001', // Non-breaking space and em spaces that trim to empty
      data: null,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      success: false,
      timestamp: new Date().toISOString(),
      requestId: 'req_test_unicode',
    });

    expect(error.message).toBe(ApiErrorCodes.UNKNOWN_ERROR);
  });

  it('should use default success value when success parameter is omitted', () => {
    // Test the default parameter branch in line 11: success = false
    const response = {
      message: 'Test message',
      data: null,
      code: ApiErrorCodes.UNKNOWN_ERROR,
      // Intentionally omitting 'success' to trigger default parameter
      timestamp: new Date().toISOString(),
      requestId: 'req_test_default',
    };

    // @ts-ignore - Testing runtime behavior with missing success parameter
    const error = new ApiError(response);

    expect(error.message).toBe('Test message');
    expect(error.success).toBe(false); // Should use the default value
    expect(error.data).toBe(null);
  });
});
