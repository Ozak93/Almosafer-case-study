import { Injectable } from '@nestjs/common';
import { API_KEY_ENV_VAR } from '../../shared/constants/api-key.constants';

@Injectable()
export class ApiKeyService {
  private readonly apiKey: string;

  constructor() {
    const envKey = process.env[API_KEY_ENV_VAR];
    if (!envKey) {
      throw new Error(
        `Missing required environment variable "${API_KEY_ENV_VAR}" for API key authentication`,
      );
    }
    this.apiKey = envKey;
  }

  getApiKey() {
    return this.apiKey;
  }
}
