import express, { type Application } from 'express';
import { initLoaders } from './loaders/index.ts';
import { logger } from './loaders/logger.ts';
import { config } from './config/index.ts';
import { errorHandler } from './core/errors/errorHandler.ts';
import { swaggerAuth } from './core/middlewares/swaggerAuth.ts';
import routes from './routes.ts';
import swaggerUi from 'swagger-ui-express';
import fs from 'node:fs';
import path from 'node:path';

export const createApp = async (): Promise<Application> => {
  const app: Application = express();
  await initLoaders({ expressApp: app });

  // docs en /api-docs. los paths vienen de swagger-output.json (npm run swagger), el resto del .env
  const swaggerFilePath = path.resolve('./swagger-output.json');
  const swaggerEnabled = Boolean(config.swagger.user && config.swagger.password);
  if (!swaggerEnabled) {
    logger.warn('documentacion deshabilitada: definir SWAGGER_USER y SWAGGER_PASSWORD en el .env');
  } else if (!fs.existsSync(swaggerFilePath)) {
    logger.warn('documentacion deshabilitada: falta swagger-output.json, correr `npm run swagger`');
  } else {
    const swaggerDocument = {
      ...JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8')),
      info: {
        title: config.swagger.title,
        description: config.swagger.description,
        version: config.swagger.version,
      },
      servers: [{ url: config.swagger.serverUrl }],
    };
    app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  app.use(config.api.prefix, routes);
  app.use(errorHandler);

  return app;
};
