import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
