import { pbkdf2, randomBytes } from 'crypto';
import * as crypto from 'crypto-js';

export const toHash = (plainText: string, salt: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    pbkdf2(
      plainText,
      salt,
      +process.env.SALT_ITERATIONS,
      64,
      'sha512',
      (err, key) => {
        if (err) reject(err);
        resolve(key.toString('base64'));
      },
    );
  });
};

export const createSalt = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    randomBytes(64, (err, buf) => {
      if (err) reject(err);
      resolve(buf.toString('base64'));
    });
  });
};

const _aes = (
  data,
  key = process.env.AES_SECRET,
  flag: 'encrypt' | 'decrypt',
) =>
  !data
    ? ''
    : (crypto.AES[flag](data, crypto.enc.Utf8.parse(key), {
        iv: crypto.enc.Utf8.parse(process.env.AES_SECRET),
        padding: crypto.pad.Pkcs7,
        mode: crypto.mode.CBC,
      }) as crypto.lib.WordArray);

export const Aes256 = {
  encode: (data: string, key?: string) => _aes(data, key, 'encrypt').toString(),
  decode: (data: string, key?: string) =>
    _aes(data, key, 'decrypt')?.toString(crypto.enc.Utf8),
};
