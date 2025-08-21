import { Action, configureStore } from '@reduxjs/toolkit';

import {
  addUserAvailabilityAction,
  getUserProfileAction,
  putUserCountryAction,
  putUserTimezoneProfileAction,
} from '@application/state/actions/profile.actions';

describe('profile.actions', () => {
  const makeStore = (extra: unknown) =>
    configureStore({
      reducer: { noop: (state: unknown = {}) => state },
      middleware: gDM => gDM({ serializableCheck: false, thunk: { extraArgument: extra } }),
    });

  it('getUserProfileAction delegates to GetUserProfileUseCase (covers line 46)', async () => {
    const getUserProfileUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, data: { profile: true } }),
    };
    const store = makeStore({ getUserProfileUseCase });
    const action = await store.dispatch(getUserProfileAction({ userId: '1' }) as unknown as Action);
    expect(getUserProfileUseCase.execute).toHaveBeenCalledWith({ userId: '1' });
    expect(getUserProfileAction.fulfilled.match(action)).toBe(true);
    if (getUserProfileAction.fulfilled.match(action)) {
      expect(action.payload.success).toBe(true);
    }
  });

  it('addUserAvailabilityAction selects addUserAvailabilityUseCase when provided', async () => {
    const addUserAvailabilityUseCase = {
      execute: jest
        .fn()
        .mockResolvedValue({ success: true, data: { timezone: 'UTC', availability: [] } }),
    };
    const store = makeStore({ addUserAvailabilityUseCase });
    const action = await store.dispatch(
      addUserAvailabilityAction({ userId: 1, windows: [], timezone: 'UTC' }) as unknown as Action
    );
    expect(addUserAvailabilityUseCase.execute).toHaveBeenCalled();
    expect(addUserAvailabilityAction.fulfilled.match(action)).toBe(true);
  });

  describe('putUserCountryAction branches (covers lines 71-79)', () => {
    it('returns fulfilled when use case succeeds (success=true)', async () => {
      const putUserCountryUseCase = {
        execute: jest.fn().mockResolvedValue({ success: true, data: { country: 'ES' } }),
      };
      const store = makeStore({ putUserCountryUseCase });
      const action = await store.dispatch(
        putUserCountryAction({ userId: 1, countryCode: 'ES' }) as unknown as Action
      );
      expect(putUserCountryUseCase.execute).toHaveBeenCalled();
      expect(putUserCountryAction.fulfilled.match(action)).toBe(true);
      if (putUserCountryAction.fulfilled.match(action)) {
        expect(action.payload.success).toBe(true);
      }
    });

    it('returns rejectedWithValue when use case returns success=false', async () => {
      const putUserCountryUseCase = {
        execute: jest.fn().mockResolvedValue({ success: false, code: 'ERR', data: null }),
      };
      const store = makeStore({ putUserCountryUseCase });
      const action = await store.dispatch(
        putUserCountryAction({ userId: 1, countryCode: 'ES' }) as unknown as Action
      );
      expect(putUserCountryUseCase.execute).toHaveBeenCalled();
      expect(putUserCountryAction.rejected.match(action)).toBe(true);
      if (putUserCountryAction.rejected.match(action)) {
        const payload = action.payload as { success?: boolean; code?: string } | undefined;
        expect(payload?.success).toBe(false);
        expect(payload?.code).toBe('ERR');
      }
    });

    it('returns rejectedWithValue on thrown error (catch path)', async () => {
      const error = new Error('boom');
      const putUserCountryUseCase = {
        execute: jest.fn().mockRejectedValue(error),
      };
      const store = makeStore({ putUserCountryUseCase });
      const action = await store.dispatch(
        putUserCountryAction({ userId: 1, countryCode: 'ES' }) as unknown as Action
      );
      expect(putUserCountryUseCase.execute).toHaveBeenCalled();
      expect(putUserCountryAction.rejected.match(action)).toBe(true);
      if (putUserCountryAction.rejected.match(action)) {
        expect(action.payload).toBe(error);
      }
    });
  });

  describe('putUserTimezoneProfileAction branches (covers lines 91-99)', () => {
    it('returns fulfilled when use case succeeds (success=true)', async () => {
      const putUserTimezoneUseCase = {
        execute: jest.fn().mockResolvedValue({ success: true, data: { timezone: 'UTC' } }),
      };
      const store = makeStore({ putUserTimezoneUseCase });
      const action = await store.dispatch(
        putUserTimezoneProfileAction({ userId: 1, timezone: 'UTC' }) as unknown as Action
      );
      expect(putUserTimezoneUseCase.execute).toHaveBeenCalled();
      expect(putUserTimezoneProfileAction.fulfilled.match(action)).toBe(true);
      if (putUserTimezoneProfileAction.fulfilled.match(action)) {
        expect(action.payload.success).toBe(true);
      }
    });

    it('returns rejectedWithValue when use case returns success=false', async () => {
      const putUserTimezoneUseCase = {
        execute: jest.fn().mockResolvedValue({ success: false, code: 'ERR_TZ', data: null }),
      };
      const store = makeStore({ putUserTimezoneUseCase });
      const action = await store.dispatch(
        putUserTimezoneProfileAction({ userId: 1, timezone: 'UTC' }) as unknown as Action
      );
      expect(putUserTimezoneUseCase.execute).toHaveBeenCalled();
      expect(putUserTimezoneProfileAction.rejected.match(action)).toBe(true);
      if (putUserTimezoneProfileAction.rejected.match(action)) {
        const payload = action.payload as { success?: boolean; code?: string } | undefined;
        expect(payload?.success).toBe(false);
        expect(payload?.code).toBe('ERR_TZ');
      }
    });

    it('returns rejectedWithValue on thrown error (catch path)', async () => {
      const error = new Error('tz-boom');
      const putUserTimezoneUseCase = {
        execute: jest.fn().mockRejectedValue(error),
      };
      const store = makeStore({ putUserTimezoneUseCase });
      const action = await store.dispatch(
        putUserTimezoneProfileAction({ userId: 1, timezone: 'UTC' }) as unknown as Action
      );
      expect(putUserTimezoneUseCase.execute).toHaveBeenCalled();
      expect(putUserTimezoneProfileAction.rejected.match(action)).toBe(true);
      if (putUserTimezoneProfileAction.rejected.match(action)) {
        expect(action.payload).toBe(error);
      }
    });
  });
});
