import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import { PreferencesState } from '@application/state/slices/preferencesSlice';
import api from '@shared/services/axiosService';
import { makeTestStore } from '@shared/utils/reduxTestUtils';
import { useAuth } from '@ui/hooks/useAuth';

import { TimeZoneSelector } from '../TimeZoneSelector';

jest.mock('@ui/hooks/useAuth');
jest.mock('@shared/services/axiosService');

describe('TimeZoneSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 12, username: 'alice', email: 'a@a.com' },
    });
  });

  it('loads timezones and shows warning when timezone is missing, hides after selecting', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({
        data: { data: { timezones: [{ id: 'Europe/Madrid', utcOffset: '+01:00' }] } },
      })
      .mockResolvedValueOnce({ data: { data: { timezone: '', availability: [] } } })
      .mockResolvedValueOnce({ data: { data: { timezone: 'Europe/Madrid', availability: [] } } });
    (api.put as unknown as jest.Mock) = jest.fn().mockResolvedValue({
      status: 200,
      data: { data: { timezone: 'Europe/Madrid', availability: [] } },
    });

    const store = makeTestStore({
      preferences: {
        gamesCatalog: [],
        selectedGameCodes: [],
        timezones: [{ id: 'Europe/Madrid', utcOffset: '+01:00' } as unknown],
        timezone: '',
        availability: [],
        loading: false,
        error: undefined,
      } as PreferencesState,
    });
    render(
      <Provider store={store}>
        <TimeZoneSelector />
      </Provider>
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());

    // Warning shown when no timezone
    expect(screen.getByTestId('timezone-warning')).toBeInTheDocument();

    // Change selection
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Europe/Madrid' } });

    await waitFor(() => {
      // Warning hidden
      expect(screen.queryByTestId('timezone-warning')).toBeNull();
    });
  });
});
