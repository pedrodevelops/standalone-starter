import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  DEV = 'development',
  PROD = 'production',
  TEST = 'test',
  HOMOL = 'homologation',
}

class AppConfigValidator {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @IsNumber()
  @Min(0)
  @Max(65535)
  APP_PORT: number;

  @IsString()
  APP_URL: string;

  @IsString()
  LOG_LEVEL: string;
}

export default registerAs('app', () => {
  const config = plainToInstance(AppConfigValidator, process.env, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(config, { skipMissingProperties: false });

  if (errors.length) {
    throw new Error(errors.toString());
  }

  return {
    url: config.APP_URL,
    port: config.APP_PORT,
    env: config.NODE_ENV,
    logLevel: config.LOG_LEVEL,
  };
});
