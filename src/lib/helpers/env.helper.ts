import { NodeEnv } from '@/config/app.config';

export type Environment = {
  NODE_ENV: NodeEnv;
  DATABASE_URL: string;
  APP_URL: string;
  APP_PORT: number;
  WEB_APP_URL: string;
  DOCS_URL: string;
  DOCS_PATH: string;
  LOG_LEVEL: string;
  JWT_SECRET: string;
};

/**
 * Gets a raw environment variable at runtime without validation.
 * @param key - The name of the environment variable to retrieve.
 * @param fallback - The default value to return if the environment variable is not set.
 * @returns The value of the environment variable, or the fallback value if not set.
 * @throws If the environment variable is not set and no fallback is provided.
 */
export const getEnv = <K extends keyof Environment>(
  key: K,
  fallback?: Environment[K],
): Environment[K] => {
  const value = process.env[key] as Environment[K] | undefined;

  if (value === undefined) {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`Missing environment variable: ${key}.`);
  }

  return value;
};
