import { Tags } from '@/lib/constants/docs.constants';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserDTO } from '../users/dto/user.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInDTO } from './dto/sign-in.dto';
import { SignUpDTO } from './dto/sign-up.dto';
import { CookieHelper } from './helpers/cookie.helper';

@ApiTags(Tags.AUTH)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/sign-up')
  @ApiOperation({
    summary: 'Signs up a new user',
  })
  async signUp(
    @Body() body: SignUpDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDTO> {
    const user = await this.authService.signUp(body);

    const access = await this.authService.grantAccess(user);

    CookieHelper.setAuthCookies(res, access);

    return user;
  }

  @Public()
  @Post('/sign-in')
  @ApiOperation({
    summary: 'Signs in a user',
  })
  async signIn(
    @Body() body: SignInDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDTO> {
    const user = await this.authService.signIn(body);
    const access = await this.authService.grantAccess(user);

    CookieHelper.setAuthCookies(res, access);

    return user;
  }

  @Post('/sign-out')
  @ApiOperation({
    summary: 'Signs out a user',
  })
  signOut(@Res() res: Response) {
    CookieHelper.clearAuthCookies(res);
  }

  @Get('/refresh-token')
  @ApiOperation({
    summary: "Refreshes a user's access token",
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = CookieHelper.getRefreshTokenCookie(req);
    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const access = await this.authService.refreshToken(token);

    CookieHelper.setAuthCookies(res, access);
  }
}
