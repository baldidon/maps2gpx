import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GpxModule } from './gpx/gpx.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GpxModule],
})
export class AppModule {}
