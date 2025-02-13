import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
} 