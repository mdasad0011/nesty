import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import CreateInitialData from '../database/seeds/create-initial-data.seed';

async function bootstrap() {
  console.log('Bootstrapping NestJS application context for seeding...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false, // Suppress default NestJS logs
  });

  try {
    const dataSource = app.get(DataSource);
    console.log('Database connection established.');

    console.log('Running seeder...');
    const seeder = new CreateInitialData();
    await seeder.run(null as any, dataSource);
    console.log('Seeder completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
