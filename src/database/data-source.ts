import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Tweet } from "../entities/tweet";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",

  synchronize: true,

  entities: [Tweet],
  logging: true,
  ssl: false,
});
