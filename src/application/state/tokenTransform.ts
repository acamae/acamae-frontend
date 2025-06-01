import CryptoJS from 'crypto-js';
import { createTransform } from 'redux-persist';

import { AuthState } from '@domain/types/auth';

const SECRET_KEY = process.env.REACT_APP_TOKEN_SECRET || 'default_secret';

/**
 * Encrypts a token string using AES.
 * @param token The token to encrypt.
 * @returns The encrypted token as a string, or null if input is falsy.
 */
export function encryptToken(token?: string | null): string | null {
  if (!token) return null;
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
}

/**
 * Decrypts a token string using AES.
 * @param token The encrypted token.
 * @returns The decrypted token as a string, or null if input is falsy or decryption fails.
 */
export function decryptToken(token?: string | null): string | null {
  if (!token) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted ? decrypted : null;
  } catch {
    return null;
  }
}

/**
 * Redux-persist transform to encrypt/decrypt only the `token` field of AuthState.
 * Just persist the necessary data
 */
export const tokenTransform = createTransform<string | null, string | null, AuthState>(
  encryptToken,
  decryptToken,
  { whitelist: ['token'] }
);
