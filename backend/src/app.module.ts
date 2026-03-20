import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Carga y validación de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
