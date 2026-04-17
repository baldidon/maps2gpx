import { Module } from '@nestjs/common';
import { GpxController } from './gpx.controller.js';
import { GpxService } from './gpx.service.js';

@Module({
  controllers: [GpxController],
  providers: [GpxService],
})
export class GpxModule {}
