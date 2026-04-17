import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GpxService } from './gpx.service.js';
import { RouteRequestDto } from './dto/route-request.dto.js';

@Controller('api')
export class GpxController {
  constructor(private readonly gpxService: GpxService) {}

  @Post('route-to-gpx')
  @HttpCode(HttpStatus.OK)
  async routeToGpx(@Body() dto: RouteRequestDto) {
    return this.gpxService.routeToGpx(dto);
  }

  @Post('resolve-url')
  @HttpCode(HttpStatus.OK)
  async resolveUrl(@Body() body: { url: string }) {
    if (!body.url) {
      return { resolvedUrl: '' };
    }
    const resolvedUrl = await this.gpxService.resolveShortUrl(body.url);
    return { resolvedUrl };
  }
}
