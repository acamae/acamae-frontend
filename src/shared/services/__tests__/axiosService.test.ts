import { jest } from '@jest/globals';

const reqOk: unknown[] = [];
const reqErr: unknown[] = [];
const resOk: unknown[] = [];
const resErr: unknown[] = [];

jest.mock('axios', () => {
  const create = jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn((ok, err) => {
          reqOk.push(ok);
          reqErr.push(err);
        }),
      },
      response: {
        use: jest.fn((ok, err) => {
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
  };
});

jest.mock('@/infrastructure/storage/localStorageService', () => ({
  localStorageService: { remove: jest.fn() },
}));

jest.mock('@application/state/slices/sessionTimerSlice', () => ({
  resetTimer: jest.fn(() => ({ type: 'session/reset' })),
}));

const storeMock = {
  getState: jest.fn(() => ({ auth: { token: null } })),
  dispatch: jest.fn(),
};

jest.mock('@application/state/store', () => ({
  store: storeMock,
}));

jest.mock('@shared/constants/apiRoutes', () => ({
  API_ROUTES: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH_TOKEN: '/auth/refresh',
      ME: '/auth/me',
    },
  },
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

  it('carga el módulo y expone la instancia', () => {
    jest.isolateModules(() => {
      const api = require('@shared/services/axiosService').default;
      expect(api).toBeDefined();
    });
  });

  it('crea la instancia de axios con la configuración base', () => {
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

  it('request interceptor añade Authorization header cuando hay token', () => {
    jest.isolateModules(() => {
      storeMock.getState.mockReturnValueOnce({ auth: { token: 'abc123' } } as unknown);

      require('@shared/services/axiosService');
      expect(reqOk).toHaveLength(1);

      const cfg = { headers: {} } as unknown;
      const result = reqOk[0](cfg);
      expect(result.headers.Authorization).toBe('Bearer abc123');
    });
  });

  it('request interceptor no añade header cuando no hay token', () => {
    jest.isolateModules(() => {
      storeMock.getState.mockReturnValueOnce({ auth: { token: null } });
      require('@shared/services/axiosService');
      const cfg = { headers: {} } as unknown;
      const result = reqOk[0](cfg);
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  it('response interceptor renueva sesión para endpoints definidos', () => {
    jest.isolateModules(() => {
      const jsonSpy = jest.spyOn(JSON, 'parse').mockReturnValue(false as unknown);

      require('@shared/services/axiosService');
      expect(resOk).toHaveLength(1);

      const resetTimer = require('@application/state/slices/sessionTimerSlice').resetTimer;

      const response = { config: { url: '/auth/login' } } as unknown;
      resOk[0](response);
      expect(storeMock.dispatch).toHaveBeenCalledWith(resetTimer());

      jsonSpy.mockRestore();
    });
  });

  it('response interceptor maneja 401 limpiando tokens', () => {
    jest.isolateModules(() => {
      const { localStorageService } = require('@/infrastructure/storage/localStorageService');
      require('@shared/services/axiosService');

      const error401 = {
        response: { status: 401 },
        config: { url: '/otro' },
      } as unknown;

      // el interceptor devuelve una promesa rechazada; ignoramos el catch
      resErr[0](error401).catch(() => {});

      expect(localStorageService.remove).toHaveBeenCalledWith('REACT_APP_AUTH_TOKEN_KEY');
      expect(localStorageService.remove).toHaveBeenCalledWith('REACT_APP_REFRESH_TOKEN_KEY');
    });
  });
});
