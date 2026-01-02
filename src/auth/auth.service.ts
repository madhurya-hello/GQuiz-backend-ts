import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(createUserDto: any, deviceKey: string) {
    const { email, password, firstName, lastName, middleName, dob } = createUserDto;
    
    const userExists = await this.usersService.findByEmail(email);
    if (userExists) throw new BadRequestException('User already exists');

    const hashPassword = await bcrypt.hash(password, 10);
    
    const newUser = await this.usersService.createWithProfile(
      { 
        email, 
        password: hashPassword, 
        deviceKey 
      },
      {
        firstName,
        lastName,
        middleName,
        dob 
      }
    );

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    
    return { ...tokens, user: newUser };
  }

  async signin(data: any) {
    const { email, password } = data;
    
    // Light fetch
    const user = await this.usersService.findByEmail(email);
    
    if (!user) throw new BadRequestException('Invalid Credentials');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw new BadRequestException('Invalid Credentials');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Heavy fetch
    const fullUser = await this.usersService.findByIdWithRelations(user.id);
    
    return { 
      ...tokens, 
      user: fullUser 
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException('Access Denied');

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    return tokens;
  }

  // HELPER: Generate JWTs
  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { 
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '5h',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { 
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '30d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  // HELPER: Hash and save Refresh Token
  async updateRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { refreshToken: hash });
  }
}