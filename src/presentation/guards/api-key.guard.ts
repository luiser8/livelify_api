import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const requireApiKey =
      this.configService.get<string>('DIAGNOSTIC_REQUIRE_API_KEY', 'true') ===
      'true';

    if (!requireApiKey) {
      return true;
    }

    const providedKey = this.extractApiKey(request);
    if (!providedKey) {
      throw new UnauthorizedException('Missing API key');
    }

    const allowedKeys = this.getAllowedKeys();
    if (allowedKeys.length === 0) {
      throw new UnauthorizedException('API key not configured');
    }

    const isValid = allowedKeys.includes(providedKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    const headerKey = (request.headers['x-api-key'] as string | undefined) ?? request.header('x-api-key') ?? undefined;
    const authHeader = request.header('authorization');
    if (authHeader && authHeader.startsWith('ApiKey ')) {
      return authHeader.slice('ApiKey '.length).trim();
    }
    return headerKey?.trim();
  }

  private getAllowedKeys(): string[] {
    const list = this.configService.get<string>('DIAGNOSTIC_API_KEYS');
    const single = this.configService.get<string>('DIAGNOSTIC_API_KEY');
    const keys: string[] = [];
    if (list) {
      keys.push(
        ...list
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length > 0),
      );
    }
    if (single) {
      keys.push(single.trim());
    }
    return Array.from(new Set(keys));
  }
}


