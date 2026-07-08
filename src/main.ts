import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('nesty API')
    .setDescription('The nesty API description')
    .setVersion('1.0')
    .addTag('nesty')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: 'api/json',
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  app.use(helmet());

  await app.listen(process.env.PORT ?? 7777);
  console.log(
    `Server is running on http://localhost:${process.env.PORT ?? 7777}`,
  );
  console.log(
    `Swagger UI is available at http://localhost:${process.env.PORT ?? 7777}/api`,
  );
}
bootstrap();
