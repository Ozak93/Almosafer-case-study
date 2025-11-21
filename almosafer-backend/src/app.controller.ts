import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiKeyGuard } from './modules/auth/api-key.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(ApiKeyGuard)
  getHello(): string {
    return this.appService.getHello();
  }
}
