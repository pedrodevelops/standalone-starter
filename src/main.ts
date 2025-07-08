import { Logger } from '@nestjs/common';
import { bootstrap } from './bootstrap';
import { getEnv } from './lib/utils/get-env.utils';

async function main() {
  const app = await bootstrap();

  await app.listen(getEnv('APP_PORT'));
}

main()
  .then(() => {
    new Logger('App').log(`Server launched at ${getEnv('APP_URL')}`);
  })
  .catch((err) => {
    new Logger('App').fatal(err);
  });
