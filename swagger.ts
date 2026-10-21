// genera swagger-output.json a partir de src/routes.ts. uso: npm run swagger
/// <reference types="node" />

import swaggerAutogen from 'swagger-autogen';
import { config } from './src/config/index.ts';

const doc = {
  info: {
    title: config.swagger.title,
    description: config.swagger.description,
    version: config.swagger.version,
  },
  servers: [{ url: config.swagger.serverUrl }],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/routes.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
