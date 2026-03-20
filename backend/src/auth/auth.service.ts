import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { User } from '../generated/prisma/client';
import { AuthRepository } from './auth.repository';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtTokenService } from './jwt-token.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto & TokenPair> {
    const exists = await this.authRepository.emailExists(dto.email);
    if (exists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.authRepository.create({
      email: dto.email,
      password: hashed,
      name: dto.name,
      lastName: dto.lastName,
      phone: dto.phone,
    });

    return this.buildTokenPair(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto & TokenPair> {
    const user = await this.authRepository.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta está inactiva');
    }

    return this.buildTokenPair(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto & TokenPair> {
    let payload: { sub: string; jti: string };

    try {
      payload = await this.jwtTokenService.verifyRefresh(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const stored = await this.authRepository.findRefreshToken(payload.jti);
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token revocado o expirado');
    }

    const user = await this.authRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    // Rotación: eliminar token anterior y emitir uno nuevo
    await this.authRepository.deleteRefreshToken(payload.jti);
    return this.buildTokenPair(user);
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.jwtTokenService.verifyRefresh(refreshToken);
      await this.authRepository.deleteRefreshToken(payload.jti);
    } catch {
      // Si el token ya es inválido, no hacemos nada
    }
  }

  async getProfile(userId: string): Promise<AuthUserDto> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return this.toUserDto(user);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async buildTokenPair(user: User): Promise<AuthResponseDto & TokenPair> {
    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + this.jwtTokenService.refreshDurationMs);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtTokenService.signAccess({ sub: user.id, email: user.email, role: user.role }),
      this.jwtTokenService.signRefresh(user.id, jti),
    ]);

    await this.authRepository.createRefreshToken({ id: jti, userId: user.id, expiresAt });

    return { accessToken, refreshToken, user: this.toUserDto(user) };
  }

  private toUserDto(user: User): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }
}
