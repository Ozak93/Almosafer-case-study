import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import {
  API_KEY_HEADER,
  API_KEY_MISSING_ERROR,
} from '../../shared/constants/api-key.constants';
import { ApiKeyRequest } from './api-key.types';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: ApiKeyRequest, _res: Response, next: NextFunction) {
    const apiKey = this.normalizeHeader(req.headers[API_KEY_HEADER]);
    if (!apiKey) {
      throw new UnauthorizedException(API_KEY_MISSING_ERROR);
    }

    req.apiKey = apiKey;
    next();
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
