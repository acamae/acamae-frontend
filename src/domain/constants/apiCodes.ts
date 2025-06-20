import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiSuccessCodes } from '@domain/constants/successCodes';

export type ApiErrorCode = (typeof ApiErrorCodes)[keyof typeof ApiErrorCodes];
export type ApiSuccessCode = (typeof ApiSuccessCodes)[keyof typeof ApiSuccessCodes];
