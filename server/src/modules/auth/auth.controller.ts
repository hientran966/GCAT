import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  // ================= LOGIN
  @Post('login')
  login(@Body() body: any) {
    const { phone, password } = body;
    return this.service.login(phone, password);
  }

  // ================= VERIFY
  @Post('verify')
  verify(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return this.service.verify(token);
  }
}
