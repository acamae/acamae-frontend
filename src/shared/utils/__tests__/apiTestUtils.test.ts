import apiService from '@shared/services/axiosService';
import {
  setupMockApiServiceCall,
  ApiResponseBody,
  SimulateApiCallParams,
} from '@shared/utils/apiTestUtils';
jest.mock('@shared/services/axiosService');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe('API Test Utils Types', () => {
  describe('ApiResponseBody', () => {
    it('should define a valid success response body', () => {
      const responseBody: ApiResponseBody<{ id: number; name: string }> = {
        success: true,
        data: { id: 1, name: 'Test' },
        status: 200,
        code: 'SUCCESS',
        message: 'Operation successful',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_123',
      };

      expect(responseBody.success).toBe(true);
      expect(responseBody.data).toEqual({ id: 1, name: 'Test' });
      expect(responseBody.status).toBe(200);
      expect(responseBody.code).toBe('SUCCESS');
      expect(responseBody.message).toBe('Operation successful');
      expect(responseBody.timestamp).toBeDefined();
      expect(responseBody.requestId).toBeDefined();
    });

    it('should define a valid success response body with different data type', () => {
      const responseBody: ApiResponseBody<{ created: boolean }> = {
        success: true,
        data: { created: true },
        status: 201,
        code: 'SUCCESS',
        message: 'Resource created',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_456',
      };

      expect(responseBody.success).toBe(true);
      expect(responseBody.data).toEqual({ created: true });
      expect(responseBody.status).toBe(201);
      expect(responseBody.code).toBe('SUCCESS');
      expect(responseBody.message).toBe('Resource created');
      expect(responseBody.timestamp).toBeDefined();
      expect(responseBody.requestId).toBeDefined();
    });

    it('should define a valid error response body', () => {
      const responseBody: ApiResponseBody<null> = {
        success: false,
        data: null,
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_789',
        error: {
          type: 'validation',
          details: [
            {
              field: 'email',
              code: 'REQUIRED',
              message: 'Email is required',
            },
          ],
        },
      };

      expect(responseBody.success).toBe(false);
      expect(responseBody.data).toBeNull();
      expect(responseBody.status).toBe(400);
      expect(responseBody.code).toBe('VALIDATION_ERROR');
      expect(responseBody.message).toBe('Invalid input');
      expect(responseBody.timestamp).toBeDefined();
      expect(responseBody.requestId).toBeDefined();
      expect(responseBody.error).toBeDefined();
      expect(responseBody.error?.type).toBe('validation');
      expect(responseBody.error?.details).toHaveLength(1);
    });
  });

  describe('SimulateApiCallParams', () => {
    it('should define valid GET parameters', () => {
      const params: SimulateApiCallParams = {
        method: 'get',
        url: '/api/users',
        httpStatusCode: 200,
        apiResponseBody: {
          success: true,
          data: undefined,
          status: 200,
          code: 'SUCCESS',
          message: 'Success',
          timestamp: new Date().toISOString(),
          requestId: 'req_test_abc',
        },
      };

      expect(params.method).toBe('get');
      expect(params.url).toBe('/api/users');
      expect(params.httpStatusCode).toBe(200);
      expect(params.apiResponseBody.success).toBe(true);
    });

    it('should define valid POST parameters with request data', () => {
      const params: SimulateApiCallParams<unknown, { name: string }> = {
        method: 'post',
        url: '/api/users',
        requestData: { name: 'John Doe' },
        httpStatusCode: 201,
        apiResponseBody: {
          success: true,
          data: undefined,
          status: 201,
          code: 'SUCCESS',
          message: 'Created',
          timestamp: new Date().toISOString(),
          requestId: 'req_test_def',
        },
      };

      expect(params.method).toBe('post');
      expect(params.url).toBe('/api/users');
      expect(params.requestData).toEqual({ name: 'John Doe' });
      expect(params.httpStatusCode).toBe(201);
      expect(params.apiResponseBody.success).toBe(true);
    });

    it('should define parameters with network error', () => {
      const params: SimulateApiCallParams = {
        method: 'get',
        url: '/api/users',
        httpStatusCode: 0,
        apiResponseBody: {
          success: false,
          data: null,
          status: 0,
          code: 'ERR_NETWORK',
          message: 'Network error',
          timestamp: new Date().toISOString(),
          requestId: 'req_test_ghi',
        },
        networkError: new Error('Network Error'),
      };

      expect(params.method).toBe('get');
      expect(params.url).toBe('/api/users');
      expect(params.httpStatusCode).toBe(0);
      expect(params.apiResponseBody.success).toBe(false);
      expect(params.networkError).toBeDefined();
      expect(params.networkError?.message).toBe('Network Error');
    });

    it('should define valid PUT parameters', () => {
      const params: SimulateApiCallParams<{ updated: boolean }, { name: string }> = {
        method: 'put',
        url: '/api/users/1',
        requestData: { name: 'Jane Doe' },
        httpStatusCode: 200,
        apiResponseBody: {
          success: true,
          data: { updated: true },
          status: 200,
          code: 'SUCCESS',
          message: 'Updated',
          timestamp: new Date().toISOString(),
          requestId: 'req_test_jkl',
        },
      };

      expect(params.method).toBe('put');
      expect(params.url).toBe('/api/users/1');
      expect(params.requestData).toEqual({ name: 'Jane Doe' });
      expect(params.httpStatusCode).toBe(200);
      expect(params.apiResponseBody.success).toBe(true);
      expect(params.apiResponseBody.data).toEqual({ updated: true });
    });

    it('should define valid DELETE parameters', () => {
      const params: SimulateApiCallParams = {
        method: 'delete',
        url: '/api/users/1',
        httpStatusCode: 200,
        apiResponseBody: {
          success: true,
          data: undefined,
          status: 200,
          code: 'SUCCESS',
          message: 'Deleted',
          timestamp: new Date().toISOString(),
          requestId: 'req_test_mno',
        },
      };

      expect(params.method).toBe('delete');
      expect(params.url).toBe('/api/users/1');
      expect(params.httpStatusCode).toBe(200);
      expect(params.apiResponseBody.success).toBe(true);
    });
  });
});

describe('setupMockApiServiceCall', () => {
  const MOCK_URL = '/test/api';
  const MOCK_OTHER_URL = '/test/other-api';
  it('should simulate a successful GET request', async () => {
    const responseData = { id: 1, name: 'Test Data' };
    const params: SimulateApiCallParams<{ id: number; name: string }> = {
      method: 'get',
      url: MOCK_URL,
      httpStatusCode: 200,
      apiResponseBody: {
        success: true,
        data: responseData,
        status: 200,
        code: 'SUCCESS',
        message: 'Success',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_123',
      },
    };
    setupMockApiServiceCall(params);
    const result = await mockedApiService.get(MOCK_URL);
    expect(result.status).toBe(200);
    expect(result.data).toEqual(params.apiResponseBody);
  });
  it('should simulate a successful POST request with correct data', async () => {
    const requestPayload = { value: 'test_payload' };
    const responseData = { created: true };
    const params: SimulateApiCallParams<{ created: boolean }, { value: string }> = {
      method: 'post',
      url: MOCK_URL,
      requestData: requestPayload,
      httpStatusCode: 201,
      apiResponseBody: {
        success: true,
        data: responseData,
        status: 201,
        code: 'SUCCESS',
        message: 'Created',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_456',
      },
    };
    setupMockApiServiceCall(params);
    const result = await mockedApiService.post(MOCK_URL, requestPayload);
    expect(result.status).toBe(201);
    expect(result.data).toEqual(params.apiResponseBody);
  });
  it('should simulate an HTTP error (e.g., 400 Bad Request)', async () => {
    const errorResponseBody: ApiResponseBody = {
      success: false,
      data: null,
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Error.BadRequest',
      timestamp: new Date().toISOString(),
      requestId: 'req_test_789',
      error: {
        type: 'validation',
        details: [
          { field: 'field_name', code: 'validation.required', message: 'Field is required' },
        ],
      },
    };
    const params: SimulateApiCallParams = {
      method: 'post',
      url: MOCK_URL,
      requestData: { data: 'invalid' },
      httpStatusCode: 400,
      apiResponseBody: errorResponseBody,
    };
    setupMockApiServiceCall(params);
    try {
      await mockedApiService.post(MOCK_URL, { data: 'invalid' });
    } catch (error) {
      if (error && typeof error === 'object' && 'isAxiosError' in error) {
        const axiosError = error as {
          isAxiosError: boolean;
          response: { status: number; data: unknown };
        };
        expect(axiosError.isAxiosError).toBe(true);
        expect(axiosError.response.status).toBe(400);
        expect(axiosError.response.data).toEqual(errorResponseBody);
      } else {
        throw error;
      }
    }
  });
  it('should simulate a network error', async () => {
    const networkError = new Error('Simulated Network Failure');
    const params: SimulateApiCallParams = {
      method: 'get',
      url: MOCK_URL,
      httpStatusCode: 503,
      apiResponseBody: {
        success: false,
        data: null,
        status: 503,
        code: 'ERR_NETWORK',
        message: 'Simulated Network Failure',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_abc',
      },
      networkError: networkError,
    };
    setupMockApiServiceCall(params);
    await expect(mockedApiService.get(MOCK_URL)).rejects.toThrow(networkError);
  });
  it('should reject if called with an unexpected URL (success case)', async () => {
    const params: SimulateApiCallParams = {
      method: 'get',
      url: MOCK_URL,
      httpStatusCode: 200,
      apiResponseBody: {
        success: true,
        data: undefined,
        status: 200,
        code: 'SUCCESS',
        message: 'Success',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_def',
      },
    };
    setupMockApiServiceCall(params);
    await expect(mockedApiService.get(MOCK_OTHER_URL)).rejects.toThrow(
      `Mocked get (status 200) called with unexpected URL: ${MOCK_OTHER_URL}. Expected: ${MOCK_URL}`
    );
  });
  it('should reject if POST called with unexpected data (success case)', async () => {
    const expectedPayload = { data: 'correct' };
    const actualPayload = { data: 'incorrect' };
    const params: SimulateApiCallParams<unknown, { data: string }> = {
      method: 'post',
      url: MOCK_URL,
      requestData: expectedPayload,
      httpStatusCode: 200,
      apiResponseBody: {
        success: true,
        data: undefined,
        status: 200,
        code: 'SUCCESS',
        message: 'Success',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_ghi',
      },
    };
    setupMockApiServiceCall(params);
    await expect(mockedApiService.post(MOCK_URL, actualPayload)).rejects.toThrow(
      `Mocked post (status 200) to ${MOCK_URL} called with unexpected data. Expected: ${JSON.stringify(expectedPayload)}, Got: ${JSON.stringify(actualPayload)}`
    );
  });
  it('should reject if called with an unexpected URL (network error case)', async () => {
    const params: SimulateApiCallParams = {
      method: 'get',
      url: MOCK_URL,
      httpStatusCode: 500,
      apiResponseBody: {
        success: false,
        data: null,
        status: 500,
        code: 'ERR_NETWORK',
        message: 'Network fail',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_jkl',
      },
      networkError: new Error('Network fail'),
    };
    setupMockApiServiceCall(params);
    await expect(mockedApiService.get(MOCK_OTHER_URL)).rejects.toThrow(
      `Mocked get (network error sim) called with unexpected URL: ${MOCK_OTHER_URL}. Expected: ${MOCK_URL}`
    );
  });
  it('should reject if POST called with unexpected data (network error case)', async () => {
    const expectedPayload = { data: 'correct' };
    const actualPayload = { data: 'incorrect' };
    const params: SimulateApiCallParams<unknown, { data: string }> = {
      method: 'post',
      url: MOCK_URL,
      requestData: expectedPayload,
      httpStatusCode: 500,
      apiResponseBody: {
        success: false,
        data: null,
        status: 500,
        code: 'ERR_NETWORK',
        message: 'Network fail',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_mno',
      },
      networkError: new Error('Network fail'),
    };
    setupMockApiServiceCall(params);
    await expect(mockedApiService.post(MOCK_URL, actualPayload)).rejects.toThrow(
      `Mocked post (network error sim) to ${MOCK_URL} called with unexpected data. Expected: ${JSON.stringify(expectedPayload)}, Got: ${JSON.stringify(actualPayload)}`
    );
  });
  it('should reject for an unsupported HTTP status code', async () => {
    const params: SimulateApiCallParams = {
      method: 'get',
      url: MOCK_URL,
      httpStatusCode: 700,
      apiResponseBody: {
        success: false,
        data: null,
        status: 700,
        code: 'UNSUPPORTED_STATUS',
        message: 'Unsupported',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_pqr',
      },
    };
    setupMockApiServiceCall(params);
    await expect(mockedApiService.get(MOCK_URL)).rejects.toThrow(
      `Unsupported HTTP status code 700 in mock setup for URL ${MOCK_URL}.`
    );
  });
  it('should simulate a successful PUT request', async () => {
    const requestPayload = { value: 'updated_payload' };
    const responseData = { updated: true };
    const params: SimulateApiCallParams<{ updated: boolean }, { value: string }> = {
      method: 'put',
      url: MOCK_URL,
      requestData: requestPayload,
      httpStatusCode: 200,
      apiResponseBody: {
        success: true,
        data: responseData,
        status: 200,
        code: 'SUCCESS',
        message: 'Updated',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_stu',
      },
    };
    setupMockApiServiceCall(params);
    const result = await mockedApiService.put(MOCK_URL, requestPayload);
    expect(result.status).toBe(200);
    expect(result.data).toEqual(params.apiResponseBody);
  });
  it('should simulate a successful DELETE request', async () => {
    const params: SimulateApiCallParams = {
      method: 'delete',
      url: MOCK_URL,
      httpStatusCode: 204,
      apiResponseBody: {
        success: true,
        data: undefined,
        status: 204,
        code: 'SUCCESS',
        message: 'Deleted',
        timestamp: new Date().toISOString(),
        requestId: 'req_test_vwx',
      },
    };
    setupMockApiServiceCall(params);
    const result = await mockedApiService.delete(MOCK_URL);
    expect(result.status).toBe(204);
    expect(result.data).toEqual(params.apiResponseBody);
  });
});
