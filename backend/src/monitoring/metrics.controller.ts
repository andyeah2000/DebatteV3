import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';

@ApiTags('Monitoring')
@Controller('metrics')
@UseGuards(ThrottlerGuard)
export class MetricsController extends PrometheusController {
  @Get()
  @ApiOperation({ summary: 'Get application metrics in Prometheus format' })
  async getMetrics(@Res() response: Response) {
    return super.index(response);
  }
} 