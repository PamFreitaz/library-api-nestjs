import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Faz as regras do DTO (@IsString, @Min) funcionarem de verdade
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do swagger: Criando a página web para testar os endpoints
  const config = new DocumentBuilder()
    .setTitle('Library API')
    .setDescription('Mini Projeto de biblioteca')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apilibrary', app, document); // Define que o Swagger abre em '/apilibrary'

  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
