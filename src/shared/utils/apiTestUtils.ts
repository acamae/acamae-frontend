import { ApiError } from '@domain/types/apiSchema';
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

// Simula la estructura de error de Axios para los mocks
export interface MockAxiosError extends Error {
  isAxiosError: boolean;
  response: {
    data: unknown;
    status: number;
  };
}

// Esta interfaz se exporta para que los tests puedan tipar sus parámetros si lo desean
export interface SimulateApiCallParams<TResponseData = unknown, TRequestData = unknown> {
  method: 'get' | 'post' | 'put' | 'delete';
  url: string;
  requestData?: TRequestData;
  httpStatusCode: number;
  apiResponseBody: ApiResponseBody<TResponseData>;
  networkError?: Error; // Para simular errores donde no hay respuesta HTTP
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

export interface IPromiseMock {
  (params?: IPromiseMockParams): jest.Mock;
}

export const promiseMock: IPromiseMock = ({ error = null }: IPromiseMockParams = {}) => {
  return jest.fn(() =>
    error
      ? Promise.reject(
          new ApiError({
            success: false,
            message: error,
            data: null,
          })
        )
      : Promise.resolve()
  );
};
