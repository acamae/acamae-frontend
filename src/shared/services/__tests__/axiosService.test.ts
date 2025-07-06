import { jest } from '@jest/globals';

import { resetTimer } from '@application/state/slices/sessionTimerSlice';
import { API_ROUTES } from '@shared/constants/apiRoutes';
import { configureAxiosService } from '@shared/services/axiosService';

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

// Mock tokenService para evitar errores
jest.mock('@infrastructure/storage/tokenService', () => ({
  tokenService: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setAccessToken: jest.fn(),
    setRefreshToken: jest.fn(),
    clear: jest.fn(),
  },
}));

// Mock localStorageService
jest.mock('@infrastructure/storage/localStorageService', () => ({
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

configureAxiosService({
  getToken: () => storeMock.getState().auth.token,
  onSessionRenewal: () => storeMock.dispatch(resetTimer()),
});

jest.mock('axios', () => {
  // Internal arrays to capture the interceptors
  const reqOk: Array<(c: unknown) => unknown> = [];
  const reqErr: Array<(e: unknown) => unknown> = [];
  const resOk: Array<(r: unknown) => unknown> = [];
  const resErr: Array<(e: unknown) => Promise<never>> = [];

  const create = jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn((ok: (cfg: unknown) => unknown, err: (e: unknown) => unknown) => {
          reqOk.push(ok);
          reqErr.push(err);
        }),
      },
      response: {
        use: jest.fn((ok: (res: unknown) => unknown, err: (e: unknown) => Promise<never>) => {
          resOk.push(ok);
          resErr.push(err);
        }),
      },
    },
  }));

  return {
    __esModule: true,
    default: { create },
    create,
    AxiosHeaders: jest.fn(),
    __mock: { reqOk, reqErr, resOk, resErr },
  };
});

type InterceptorFn = (...args: unknown[]) => unknown;

const getAxiosMock = () =>
  (
    require('axios') as {
      __mock: {
        reqOk: InterceptorFn[];
        reqErr: InterceptorFn[];
        resOk: InterceptorFn[];
        resErr: InterceptorFn[];
      };
    }
  ).__mock;

beforeAll(() => {
  jest.spyOn(global.console, 'log').mockImplementation(() => {});
  jest.spyOn(global.console, 'error').mockImplementation(() => {});
});

describe('axiosService unit tests', () => {
  beforeEach(() => {
    getAxiosMock().reqOk.length = 0;
    getAxiosMock().resOk.length = 0;
    getAxiosMock().resErr.length = 0;
    jest.resetModules();
    jest.clearAllMocks();
    jest.spyOn(global.console, 'log').mockImplementation(() => {});
    jest.spyOn(global.console, 'error').mockImplementation(() => {});
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
      const { reqOk } = getAxiosMock();
      expect(reqOk).toHaveLength(1);

      const cfg: AxiosConfig = { headers: {} };
      const result = (reqOk[0] as (c: AxiosConfig) => AxiosConfig)(cfg);
      expect(result.headers.Authorization).toBe('Bearer abc123');
    });
  });

  it('should not add header when there is no token', () => {
    jest.isolateModules(() => {
      storeMock.getState.mockReturnValueOnce({ auth: { token: null } } as StoreState);
      require('@shared/services/axiosService');
      const { reqOk } = getAxiosMock();
      const cfg: AxiosConfig = { headers: {} };
      const result = (reqOk[0] as (c: AxiosConfig) => AxiosConfig)(cfg);
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  it('should renew session for defined endpoints', () => {
    jest.isolateModules(() => {
      const jsonSpy = jest.spyOn(JSON, 'parse').mockReturnValue(false as unknown);

      require('@shared/services/axiosService');
      const { resOk } = getAxiosMock();
      expect(resOk).toHaveLength(1);

      const resetTimer = require('@application/state/slices/sessionTimerSlice').resetTimer;

      const response: AxiosResponse = { config: { url: API_ROUTES.AUTH.LOGIN } };
      resOk[0](response);
      expect(storeMock.dispatch).toHaveBeenCalledWith(resetTimer());

      jsonSpy.mockRestore();
    });
  });

  it('should handle 401 by clearing tokens', async () => {
    await jest.isolateModulesAsync(async () => {
      require('@shared/services/axiosService');

      const error401: AxiosResponse & { response: { status: number } } = {
        response: { status: 401 },
        config: { url: '/otro' },
      };

      const { resErr } = getAxiosMock();
      await expect((resErr[0] as (e: unknown) => Promise<never>)(error401)).rejects.toBeInstanceOf(
        Error
      );
      const { tokenService } = require('@infrastructure/storage/tokenService');
      expect(tokenService.clear).toHaveBeenCalled();
    });
  });

  it('should not throw when ENABLE_ANALYTICS is true', () => {
    jest.isolateModules(() => {
      process.env.REACT_APP_ENABLE_ANALYTICS = 'true';
      require('@shared/services/axiosService');
      const response: AxiosResponse = { config: { url: '/some' } } as AxiosResponse;
      const { resOk } = getAxiosMock();
      expect(() => resOk[0](response)).not.toThrow();
      delete process.env.REACT_APP_ENABLE_ANALYTICS;
    });
  });

  it('should handle error.request branch', async () => {
    await jest.isolateModulesAsync(async () => {
      require('@shared/services/axiosService');

      const errorObj: unknown = {
        request: {},
        message: 'timeout',
        code: 'ECONNABORTED',
        config: {},
      };

      const { resErr } = getAxiosMock();
      await expect(resErr[0](errorObj)).rejects.toBeInstanceOf(Error);
    });
  });

  it('should handle generic error branch', async () => {
    await jest.isolateModulesAsync(async () => {
      require('@shared/services/axiosService');

      const errorObj: unknown = { message: 'boom', code: 'GEN', config: {} };

      const { resErr } = getAxiosMock();
      await expect(resErr[0](errorObj)).rejects.toBeInstanceOf(Error);
    });
  });

  it('should add Authorization header only once', () => {
    jest.isolateModules(() => {
      storeMock.getState.mockReturnValueOnce({ auth: { token: 'abc' } });
      require('@shared/services/axiosService');
      const { reqOk } = getAxiosMock();
      const cfg: AxiosConfig = { headers: {} };
      const modified = (reqOk[0] as (c: AxiosConfig) => AxiosConfig)(cfg);
      expect(modified.headers.Authorization).toBe('Bearer abc');
    });
  });

  it('should propagate request interceptor errors as Error', async () => {
    await jest.isolateModulesAsync(async () => {
      require('@shared/services/axiosService');

      const errorObj = 'boom';
      // Invoke captured request error handler and assert the rejection is an Error instance
      const { reqErr } = getAxiosMock();
      await expect(reqErr[0](errorObj)).rejects.toBeInstanceOf(Error);
    });
  });

  it('should keep existing headers and set Authorization again (duplicate block)', () => {
    jest.isolateModules(() => {
      storeMock.getState.mockReturnValueOnce({ auth: { token: 'dup' } });
      require('@shared/services/axiosService');

      const { reqOk } = getAxiosMock();
      const cfg: AxiosConfig = { headers: { 'X-Custom': '1' } };
      const modified = (reqOk[0] as (c: AxiosConfig) => AxiosConfig)(cfg);
      expect(modified.headers.Authorization).toBe('Bearer dup');
      expect(modified.headers['X-Custom']).toBe('1');
    });
  });

  it('should clear tokens and reset timer on 401 error', async () => {
    await jest.isolateModulesAsync(async () => {
      const { resetTimer } = require('@application/state/slices/sessionTimerSlice');

      require('@shared/services/axiosService');

      const error401: unknown = {
        response: { status: 401 },
        config: { url: API_ROUTES.AUTH.LOGIN },
      };

      const { resErr } = getAxiosMock();
      await expect((resErr[0] as (e: unknown) => Promise<never>)(error401)).rejects.toBeInstanceOf(
        Error
      );
      const { tokenService } = require('@infrastructure/storage/tokenService');
      expect(tokenService.clear).toHaveBeenCalled();
      expect(storeMock.dispatch).toHaveBeenCalledWith(resetTimer());
    });
  });

  it('should dispatch resetTimer when response comes from renewal endpoint', () => {
    jest.isolateModules(() => {
      const { resetTimer } = require('@application/state/slices/sessionTimerSlice');

      // Prevent JSON.parse from throwing when ENABLE_ANALYTICS is undefined
      const jsonSpy = jest.spyOn(JSON, 'parse').mockReturnValue(false as unknown);
      require('@shared/services/axiosService');

      const res: AxiosResponse = { config: { url: API_ROUTES.AUTH.ME } } as AxiosResponse;
      const { resOk } = getAxiosMock();
      resOk[0](res);
      expect(storeMock.dispatch).toHaveBeenCalledWith(resetTimer());

      jsonSpy.mockRestore();
    });
  });

  it('should create headers object when missing', () => {
    jest.isolateModules(() => {
      storeMock.getState.mockReturnValueOnce({ auth: { token: 'new' } } as StoreState);
      require('@shared/services/axiosService');

      // Pass config WITHOUT headers field to trigger the falsy branch of `config.headers || {}`
      const { reqOk } = getAxiosMock();
      const cfg = {} as unknown as AxiosConfig;
      const modified = (reqOk[0] as (c: AxiosConfig) => AxiosConfig)(cfg);
      expect(modified.headers.Authorization).toBe('Bearer new');
    });
  });

  it('should propagate response interceptor errors when error is already an instance of Error', async () => {
    await jest.isolateModulesAsync(async () => {
      require('@shared/services/axiosService');
      const errInstance = Object.assign(new Error('native'), { config: {} });
      const { resErr } = getAxiosMock();
      await expect(resErr[0](errInstance)).rejects.toBe(errInstance);
    });
  });

  it('should clear tokens on 401 error when refresh fails', async () => {
    await jest.isolateModulesAsync(async () => {
      // Mock tokenService para simular que no hay refresh token
      const { tokenService } = require('@infrastructure/storage/tokenService');
      jest.spyOn(tokenService, 'getRefreshToken').mockReturnValue(null);
      jest.spyOn(tokenService, 'clear').mockImplementation(() => {});

      require('@shared/services/axiosService');

      const error401 = {
        response: { status: 401 },
        config: { _retry: false, headers: {}, url: '/protegido' },
      };

      const { resErr } = getAxiosMock();
      await expect(resErr[0](error401)).rejects.toBeInstanceOf(Error);

      // Verificamos que se llamó a clear cuando el refresh falla
      expect(tokenService.clear).toHaveBeenCalled();
    });
  });
});
