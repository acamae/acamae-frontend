import apiService from '@shared/services/axiosService';

/**
 * Represents the structured body of an API response, as defined by the application.
 */
export interface ApiResponseBody<TData = null> {
  success: boolean;
  data?: TData;
  message?: string;
  errors?: { field: string; errorKey: string }[];
}

// Simulates the error structure of Axios for mocks
export interface MockAxiosError extends Error {
  isAxiosError: boolean;
  response: {
    data: unknown;
    status: number;
  };
}

// This interface is exported so that tests can type their parameters if they want
export interface SimulateApiCallParams<TResponseData = unknown, TRequestData = unknown> {
  method: 'get' | 'post' | 'put' | 'delete';
  url: string;
  requestData?: TRequestData;
  httpStatusCode: number;
  apiResponseBody: ApiResponseBody<TResponseData>;
  networkError?: Error; // To simulate errors where there is no HTTP response
}

export const setupMockApiServiceCall = <TResponseData = unknown, TRequestData = unknown>(
  params: SimulateApiCallParams<TResponseData, TRequestData>
) => {
  const {
    method,
    url: expectedUrl,
    requestData: expectedRequestData,
    httpStatusCode,
    apiResponseBody,
    networkError,
  } = params;

  const serviceMethod = (apiService as jest.Mocked<typeof apiService>)[method];

  if (networkError) {
    serviceMethod.mockImplementation(async (url: string, requestPayload?: unknown) => {
      if (url !== expectedUrl) {
        return Promise.reject(
          new Error(
            `Mocked ${method} (network error sim) called with unexpected URL: ${url}. Expected: ${expectedUrl}`
          )
        );
      }
      if (
        (method === 'post' || method === 'put') &&
        expectedRequestData &&
        JSON.stringify(requestPayload) !== JSON.stringify(expectedRequestData)
      ) {
        return Promise.reject(
          new Error(
            `Mocked ${method} (network error sim) to ${url} called with unexpected data. Expected: ${JSON.stringify(expectedRequestData)}, Got: ${JSON.stringify(requestPayload)}`
          )
        );
      }
      return Promise.reject(networkError);
    });
    return;
  }

  serviceMethod.mockImplementation(async (url: string, requestPayload?: unknown) => {
    if (url !== expectedUrl) {
      return Promise.reject(
        new Error(
          `Mocked ${method} (status ${httpStatusCode}) called with unexpected URL: ${url}. Expected: ${expectedUrl}`
        )
      );
    }
    if (
      (method === 'post' || method === 'put') &&
      expectedRequestData &&
      JSON.stringify(requestPayload) !== JSON.stringify(expectedRequestData)
    ) {
      return Promise.reject(
        new Error(
          `Mocked ${method} (status ${httpStatusCode}) to ${url} called with unexpected data. Expected: ${JSON.stringify(expectedRequestData)}, Got: ${JSON.stringify(requestPayload)}`
        )
      );
    }

    if (httpStatusCode >= 200 && httpStatusCode < 300) {
      return Promise.resolve({
        data: apiResponseBody,
        status: httpStatusCode,
      });
    } else if (httpStatusCode >= 300 && httpStatusCode < 600) {
      const error: MockAxiosError = Object.assign(
        new Error(`Request failed with status code ${httpStatusCode}`),
        {
          isAxiosError: true,
          response: {
            data: apiResponseBody,
            status: httpStatusCode,
          },
        }
      );
      return Promise.reject(error);
    } else {
      return Promise.reject(
        new Error(
          `Unsupported HTTP status code ${httpStatusCode} in mock setup for URL ${expectedUrl}.`
        )
      );
    }
  });
};

export interface IPromiseMockParams {
  error?: string | null;
}

// Type alias instead of interface with only function signature (eslint consistent-type-definitions)
export type IPromiseMock = (params?: IPromiseMockParams) => jest.Mock;

export const promiseMock: IPromiseMock = ({ error = null }: IPromiseMockParams = {}) => {
  return jest.fn(() => Promise.resolve(error ? { message: error } : undefined));
};
