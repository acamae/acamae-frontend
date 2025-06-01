import apiService from '@shared/services/axiosService';
import {
  setupMockApiServiceCall,
  ApiResponseBody,
  SimulateApiCallParams,
} from '@shared/utils/apiTestUtils';
jest.mock('@shared/services/axiosService');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;
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
        message: 'Success',
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
        message: 'Created',
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
      message: 'Error.BadRequest',
      errors: [{ field: 'field_name', errorKey: 'validation.required' }],
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
      apiResponseBody: {} as ApiResponseBody,
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
      apiResponseBody: { success: true, message: 'Success' },
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
      apiResponseBody: { success: true, message: 'Success' },
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
      apiResponseBody: {} as ApiResponseBody,
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
      apiResponseBody: {} as ApiResponseBody,
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
      apiResponseBody: { success: false, message: 'Unsupported' },
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
        message: 'Updated',
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
      apiResponseBody: { success: true, message: 'Deleted' },
    };
    setupMockApiServiceCall(params);
    const result = await mockedApiService.delete(MOCK_URL);
    expect(result.status).toBe(204);
    expect(result.data).toEqual(params.apiResponseBody);
  });
});
