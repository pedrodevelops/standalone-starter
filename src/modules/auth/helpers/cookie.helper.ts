import { Request, Response } from 'express';
import { CookieNames } from '../auth.constants';
import { Access } from '../models/access.model';

export class CookieHelper {
  static setAuthCookies(res: Response, access: Access) {
    res.cookie(CookieNames.ACCESS_TOKEN, access.access_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour
    });
    res.cookie(CookieNames.REFRESH_TOKEN, access.access_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });
  }

  static clearAuthCookies(res: Response) {
    res.clearCookie(CookieNames.ACCESS_TOKEN);
    res.clearCookie(CookieNames.REFRESH_TOKEN);
  }

  static getRefreshTokenCookie(req: Request) {
    return req.cookies[CookieNames.REFRESH_TOKEN] as string | undefined;
  }

  static getAccessTokenCookie(req: Request) {
    return req.cookies[CookieNames.ACCESS_TOKEN] as string | undefined;
  }
}
