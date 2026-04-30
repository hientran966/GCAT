/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('MYSQL') private readonly db: any,
    private readonly jwtService: JwtService,
  ) {}

  // ================= LOGIN
  async login(phone: string, password: string) {
    const [rows]: any = await this.db.execute(
      `SELECT * FROM users WHERE phone = ? AND deleted_at IS NULL`,
      [phone],
    );

    const user = rows[0];
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      id: user.id,
      phone: user.phone,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  // ================= VERIFY TOKEN
  verify(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
