import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

class DocsConfigValidator {
  @IsString()
  DOCS_URL: string;

  @IsString()
  DOCS_PATH: string;
}

export default registerAs('docs', () => {
  const config = plainToInstance(DocsConfigValidator, process.env, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(config, { skipMissingProperties: false });

  if (errors.length) {
    throw new Error(errors.toString());
  }

  return {
    url: config.DOCS_URL,
    path: config.DOCS_PATH,
  };
});
