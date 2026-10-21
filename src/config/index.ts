/**
 * Es la configuracion centralizada. 
 * Centralizamos accesos al env ya sea para buscar el PORT, o DB URI
 * Sirve para no tener dispersos los datos.
 */

import dotenv from 'dotenv';
const envFound = dotenv.config({ quiet: true }); // config(), lee el .env y parsea el contenido dentro del obj global de process.env de node

if (envFound.error) {
    console.warn("X no se encontro el archivo .env");
}
//uso: import {config} from './config/index.ts'

const port = parseInt(process.env.PORT || '3000', 10);
const apiPrefix = process.env.API_PREFIX || '/api';

export const config = {
    port,
    nodeEnv: process.env.NODE_ENV || 'development',
    api: {
        prefix: apiPrefix
    },
    logs: {
        level: process.env.LOG_LEVEL || 'info',
        // si se define, los logs tambien se guardan en este archivo
        file: process.env.LOG_FILE || ''
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        name: process.env.DB_NAME || 'app_db',
        // si es true y la BD no responde al arrancar, el servidor no inicia
        // por defecto solo en produccion
        required: process.env.DB_REQUIRED
            ? process.env.DB_REQUIRED === 'true'
            : (process.env.NODE_ENV || 'development') === 'production'
    },
    // /api-docs, sin usuario y clave no se monta
    swagger: {
        user: process.env.SWAGGER_USER || '',
        password: process.env.SWAGGER_PASSWORD || '',
        title: process.env.SWAGGER_TITLE || 'API Template Express',
        description: process.env.SWAGGER_DESCRIPTION || 'Documentación OpenAPI generada automáticamente',
        version: process.env.SWAGGER_VERSION || '1.0.0',
        // por defecto sale de PORT y API_PREFIX
        serverUrl: process.env.SWAGGER_SERVER_URL || `http://localhost:${port}${apiPrefix}`
    },
    ai: {
        url: process.env.AI_SERVICE_URL || '',
        apiKey: process.env.AI_SERVICE_API_KEY || ''
    }
};