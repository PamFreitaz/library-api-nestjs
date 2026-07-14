import { DataSource } from "typeorm";
import { Book } from "../entities/book-entity";

export const AppDataSource = new DataSource({

  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Book],
  synchronize: false,
  logging: true,
  options: { 
    encrypt: false,
    trustServerCertificate: true,
  },

});