import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyMiddleware } from 'src/modules/auth/api-key.middleware';
import { ApiKeyService } from 'src/modules/auth/api-key.service';

@Global()
@Module({
  providers: [
    ApiKeyService,
    ApiKeyGuard,
    {
      provide: APP_GUARD,
      useExisting: ApiKeyGuard,
    },
  ],
  exports: [ApiKeyService, ApiKeyGuard],
})
export class ApiKeyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
