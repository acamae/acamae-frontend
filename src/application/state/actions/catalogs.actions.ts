import { createAsyncThunk } from '@reduxjs/toolkit';

import { GetCountriesCatalogUseCase } from '@application/use-cases/catalogs/CountriesCatalogUseCase';
import { GetGamesCatalogUseCase } from '@application/use-cases/catalogs/GamesCatalogUseCase';
import { GetTimezonesCatalogUseCase } from '@application/use-cases/catalogs/TimezonesCatalogUseCase';

export const fetchTimezonesCatalogAction = createAsyncThunk(
  'catalogs/fetchTimezones',
  async (_, { extra }) => {
    const { getTimezonesCatalogUseCase } = extra as {
      getTimezonesCatalogUseCase: GetTimezonesCatalogUseCase;
    };
    return await getTimezonesCatalogUseCase.execute();
  }
);

export const fetchCountriesCatalogAction = createAsyncThunk(
  'catalogs/fetchCountries',
  async (_, { extra }) => {
    const { getCountriesCatalogUseCase, getCountriesUseCase } = extra as {
      getCountriesCatalogUseCase?: GetCountriesCatalogUseCase;
      getCountriesUseCase?: GetCountriesCatalogUseCase;
    };
    const useCase = getCountriesCatalogUseCase ?? getCountriesUseCase;
    return await (useCase as GetCountriesCatalogUseCase).execute();
  }
);

export const fetchGamesCatalogAction = createAsyncThunk(
  'catalogs/fetchGamesCatalog',
  async (_, { extra }) => {
    const { getGamesCatalogUseCase, listGamesUseCase } = extra as {
      getGamesCatalogUseCase?: GetGamesCatalogUseCase;
      listGamesUseCase?: GetGamesCatalogUseCase;
    };
    const useCase = getGamesCatalogUseCase ?? listGamesUseCase;
    return await (useCase as GetGamesCatalogUseCase).execute();
  }
);
