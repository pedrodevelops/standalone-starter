import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

class DatabaseConfigValidator {
  @IsString()
  DATABASE_URL: string;
}

export default registerAs('database', () => {
  const config = plainToInstance(DatabaseConfigValidator, process.env, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(config, { skipMissingProperties: false });

  if (errors.length) {
    throw new Error(errors.toString());
  }

  return {
    url: config.DATABASE_URL,
  };
});
