import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

const { JWT_SECRET } = process.env;

/**
 * @description JWT 토큰 생성
 * @param {any} payload
 * @param {any?} options
 * @returns {Promise<string>} token
 */
export function generateToken(payload: any, options?: any): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: '7d',
        ...options,
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}

/**
 * @description JWT 토큰에서 유저 decoded
 * @param {string} token
 * @returns {Promise<any>} User
 */
export function decodeToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (error, decoded) => {
      if (error) reject(error);
      resolve(decoded);
    });
  });
}

/**
 * @description decoded한 토근의 값을 타입으로 선언
 */
export type TokenPayload = {
  _id: string;
  email: string;
  profile: {
    thumbnail: string;
    shortBio: string;
    username: string;
  };
};
