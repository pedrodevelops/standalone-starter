import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

class WebConfigValidator {
  @IsString()
  WEB_APP_URL: string;
}

export default registerAs('web', () => {
  const config = plainToInstance(WebConfigValidator, process.env, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(config, { skipMissingProperties: false });

  if (errors.length) {
    throw new Error(errors.toString());
  }

  return {
    url: config.WEB_APP_URL,
  };
});
