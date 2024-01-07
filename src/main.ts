import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logLevel = {
    error: ['error'],
    warn: ['warn', 'error'],
    log: ['log', 'warn', 'error'],
    verbose: ['verbose', 'log', 'warn', 'error'],
    debug: ['debug', 'verbose', 'log', 'warn', 'error'],
  };

  const app = await NestFactory.create(AppModule, {
    logger: logLevel[process.env.LOG_LEVEL || 'log'],
    abortOnError: false,
  });

  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  const config = new DocumentBuilder()
    .setTitle('CopyDash API')
    .setDescription('Backend responsável por processamento de dados da CopyDash')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT || 3003;

  await app
    .listen(PORT, () => Logger.log(`Server running on port ${PORT}`))
    .catch((err) => Logger.error(err));
}
bootstrap();
