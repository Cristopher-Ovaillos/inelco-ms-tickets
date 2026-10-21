//para unificar la ejecucion de los loaders en el orden correcto

import {type Application} from 'express';
import {expressLoader} from './express.ts';
import {logger} from './logger.ts';

export const initLoaders = async ({expressApp}: {expressApp:Application}): Promise<void> => {
    //inicializar conexion a la bd antes de express
    /**
     * await databaseLoader();
     * logger.info('DB loaded and connected');
     */

    expressLoader({app: expressApp});
    logger.info('- Middlewares cargados.');

};