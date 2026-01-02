import { Controller, Post, Body,Headers, Get, UseGuards, Req ,BadRequestException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(
    @Body() createUserDto: any,
    @Headers('x-client-type') clientType: string,
    @Headers('x-device-key') deviceKey: string
  ) {
    console.log('Client Type:', clientType);
    console.log('Device Key:', deviceKey);

    // Validate Device Key for Mobile
    if (clientType === 'mobile' && !deviceKey) {
      throw new BadRequestException('Device key is missing. Please restart the app.');
    }

    // Pass the deviceKey separately to the service
    return this.authService.signup(createUserDto, deviceKey);
  }

  @Post('signin')
  signin(@Body() data: any) {
    return this.authService.signin(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refresh')
  refreshTokens(@Req() req: any, @Body() body: any) {
    const userId = req.user.sub; 
    return this.authService.refreshTokens(userId, body.refreshToken);
  }
}