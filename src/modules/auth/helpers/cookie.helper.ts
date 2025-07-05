import { Request, Response } from 'express';
import { authConstants } from '../auth.constants';
import { Access } from '../models/access.model';

export class CookieHelper {
  static setAuthCookies(res: Response, access: Access) {
    res.cookie(authConstants.accessTokenCookieName, access.access_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour
    });
    res.cookie(authConstants.refreshTokenCookieName, access.access_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });
  }

  static clearAuthCookies(res: Response) {
    res.clearCookie(authConstants.accessTokenCookieName);
    res.clearCookie(authConstants.refreshTokenCookieName);
  }

  static getRefreshTokenCookie(req: Request) {
    return req.cookies[authConstants.refreshTokenCookieName] as
      | string
      | undefined;
  }

  static getAccessTokenCookie(req: Request) {
    return req.cookies[authConstants.accessTokenCookieName] as
      | string
      | undefined;
  }
}
