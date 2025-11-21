import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from 'src/modules/auth/api-key.service';
import { ApiKeyRequest } from 'src/modules/auth/api-key.types';
import {
  API_KEY_HEADER,
  API_KEY_MISSING_ERROR,
  API_KEY_INVALID_ERROR,
} from 'src/shared/constants/api-key.constants';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ApiKeyRequest>();
    const headerValue = this.normalizeHeader(request.headers[API_KEY_HEADER]);
    const apiKey = request.apiKey ?? headerValue;

    if (!apiKey) {
      throw new UnauthorizedException(API_KEY_MISSING_ERROR);
    }

    if (apiKey !== this.apiKeyService.getApiKey()) {
      throw new UnauthorizedException(API_KEY_INVALID_ERROR);
    }

    return true;
  }

  private normalizeHeader(value: string | string[] | undefined) {
    if (!value) {
      return null;
    }

    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }
}
