import { Request } from 'express';

export interface ApiKeyRequest extends Request {
  apiKey?: string;
}
