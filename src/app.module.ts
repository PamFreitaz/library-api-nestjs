import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookController } from './controllers/book/book.controller';
import { BookService } from './services/book/book-service';
import { Book } from './domain/entities/book-entity';
import { BookProviderRepository } from './domain/interface/book/book.interface.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/env/.env',
    }),

   /*   TypeOrmModule.forRootAsync({
      useFactory: async (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),*/

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'mssql',
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Book],
        synchronize: false,
        logging: true,
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      }),
    }),
    
    TypeOrmModule.forFeature([Book]),
  ],
  controllers: [BookController],
  providers: [BookService, BookProviderRepository],
})
export class AppModule {}
