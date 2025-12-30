import { Controller, Post, Body,Headers, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(
    @Body() createUserDto: any,
    @Headers('x-client-type') clientType: string // <--- How to read it
  ) {
    // You can now pass 'clientType' to your service if you want
    console.log('User signing up from:', clientType); 
    return this.authService.signup(createUserDto);
  }

  @Post('signin')
  signin(@Body() data: any) {
    return this.authService.signin(data);
  }

  @Post('refresh')
  refreshTokens(@Body() body: any) {
    // Body should be { userId: 1, refreshToken: "..." }
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }
}