import { jest } from '@jest/globals';

import { API_ROUTES } from '@shared/constants/apiRoutes';

interface StoreState {
  auth: {
    token: string | null;
  };
}

interface AxiosConfig {
  headers: Record<string, string>;
}

interface AxiosResponse {
  config: {
    url: string;
  };
}

const reqOk: ((config: AxiosConfig) => AxiosConfig)[] = [];
const reqErr: ((error: unknown) => unknown)[] = [];
const resOk: ((response: AxiosResponse) => AxiosResponse)[] = [];
const resErr: ((error: unknown) => Promise<never>)[] = [];

jest.mock('axios', () => {
  const create = jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn(
          (ok: (config: AxiosConfig) => AxiosConfig, err: (error: unknown) => unknown) => {
            reqOk.push(ok);
            reqErr.push(err);
          }
        ),
      },
      response: {
        use: jest.fn(
          (
            ok: (response: AxiosResponse) => AxiosResponse,
            err: (error: unknown) => Promise<never>
          ) => {
            resOk.push(ok);
            resErr.push(err);
          }
        ),
      },
    },
  }));

  return {
    __esModule: true,
    default: { create },
    create,
    AxiosHeaders: jest.fn(),
  };
});

jest.mock('@/infrastructure/storage/localStorageService', () => ({
  localStorageService: { remove: jest.fn() },
}));

jest.mock('@application/state/slices/sessionTimerSlice', () => ({
  resetTimer: jest.fn(() => ({ type: 'session/reset' })),
}));

const storeMock = {
  getState: jest.fn(() => ({ auth: { token: null } }) as StoreState),
  dispatch: jest.fn(),
};

jest.mock('@application/state/store', () => ({
  store: storeMock,
}));

beforeAll(() => {
  jest.spyOn(global.console, 'log').mockImplementation(() => {});
  jest.spyOn(global.console, 'error').mockImplementation(() => {});
});

describe('axiosService unit tests', () => {
  beforeEach(() => {
    reqOk.length = 0;
    reqErr.length = 0;
    resOk.length = 0;
    resErr.length = 0;
    jest.clearAllMocks();
  });

  it('should load the module and expose the instance', () => {
    jest.isolateModules(() => {
      const api = require('@shared/services/axiosService').default;
      expect(api).toBeDefined();
    });
  });

  it('should create the axios instance with the base configuration', () => {
    jest.isolateModules(() => {
      require('@shared/services/axiosService');
      const axios = require('axios');
      expect(axios.create).toHaveBeenCalledTimes(1);
      const cfg = (axios.create as jest.Mock).mock.calls[0][0];
      expect(cfg).toMatchObject({
        baseURL: expect.any(String),
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
    });
  });

  it('should add Authorization header when there is a token', () => {
    jest.isolateModules(() => {
      storeMock.getState.mockReturnValueOnce({ auth: { token: 'abc123' } } as StoreState);

      require('@shared/services/axiosService');
      expect(reqOk).toHaveLength(1);

      const cfg: AxiosConfig = { headers: {} };
      const result = reqOk[0](cfg);
      expect(result.headers.Authorization).toBe('Bearer abc123');
    });
  });

  it('should not add header when there is no token', () => {
    jest.isolateModules(() => {
      storeMock.getState.mockReturnValueOnce({ auth: { token: null } } as StoreState);
      require('@shared/services/axiosService');
      const cfg: AxiosConfig = { headers: {} };
      const result = reqOk[0](cfg);
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  it('should renew session for defined endpoints', () => {
    jest.isolateModules(() => {
      const jsonSpy = jest.spyOn(JSON, 'parse').mockReturnValue(false as unknown);

      require('@shared/services/axiosService');
      expect(resOk).toHaveLength(1);

      const resetTimer = require('@application/state/slices/sessionTimerSlice').resetTimer;

      const response: AxiosResponse = { config: { url: API_ROUTES.AUTH.LOGIN } };
      resOk[0](response);
      expect(storeMock.dispatch).toHaveBeenCalledWith(resetTimer());

      jsonSpy.mockRestore();
    });
  });

  it('should handle 401 by clearing tokens', () => {
    jest.isolateModules(() => {
      const { localStorageService } = require('@infrastructure/storage/localStorageService');
      require('@shared/services/axiosService');

      const error401: AxiosResponse & { response: { status: number } } = {
        response: { status: 401 },
        config: { url: '/otro' },
      };

      resErr[0](error401).catch(() => {});

      expect(localStorageService.remove).toHaveBeenCalledWith('REACT_APP_AUTH_TOKEN_KEY');
      expect(localStorageService.remove).toHaveBeenCalledWith('REACT_APP_REFRESH_TOKEN_KEY');
    });
  });
});
