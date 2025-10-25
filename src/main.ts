import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1/');

  // cors
  app.enableCors();
  // swagger
  const options = {
    customCss: `
      .topbar-wrapper img {content:url(\'https://res.cloudinary.com/fedev/image/upload/v1690627890/moment/app-logo_tmonpb.jpg\'); width:140px; height:80px;}
      .swagger-ui .topbar { background-color: white; }
      `,
    customSiteTitle: 'DPM Delivery API',
    customfavIcon:
      'https://res.cloudinary.com/fedev/image/upload/v1690627890/moment/app-logo_tmonpb.jpg',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
    },
  };

  // if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('DPM Delivery API')
    .setDescription('DPM Delivery Service API Documentation')
    .setVersion('1.0')
    .addTag('DPM Delivery')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/doc', app, document, options);
  // }
  // class validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // start server
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
