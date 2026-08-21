import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { environment } from "./config/env.js";

const app = await NestFactory.create(AppModule);
app.setGlobalPrefix("api");
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
await app.listen(environment.API_PORT);
