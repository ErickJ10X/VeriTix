import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  const config = app.get(ConfigService);

  // Seguridad: headers HTTP (X-Content-Type-Options, Strict-Transport-Security, etc.)
  app.use(helmet());
  app.use(cookieParser());

  // Prefijo global de la API
  const apiPrefix = config.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL'),
    credentials: true, // necesario para que el navegador envíe las cookies HTTP-only
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('VeriTix API')
    .setDescription(
      'Documentación de la API REST de VeriTix — plataforma de venta y validación de boletos para conciertos y eventos en vivo.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Access token JWT obtenido en /auth/login o /auth/register. Expira en 15 min.',
      },
      'access-token',
    )
    .addCookieAuth(
      'refresh_token',
      {
        type: 'apiKey',
        in: 'cookie',
        description:
          'Refresh token HTTP-only enviado automáticamente por el navegador. Expira en 7 días.',
      },
      'refresh_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Servidor iniciado en http://localhost:${port}`);
  logger.log(`Documentación Swagger en http://localhost:${port}/docs`);
}
bootstrap();
