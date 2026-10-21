
// inicio de http server en el puerto especificado

import { createApp } from './app.ts';
import { config } from './config/index.ts';
import { logger } from './loaders/logger.ts';
import { pgp, checkDbConnection } from './config/database.ts';

const startServer = async () => {
  //si la BD es obligatoria (DB_REQUIRED) y no responde, falla aca y el catch final hace process.exit(1)
  try {
    await checkDbConnection();
    logger.info(' DB: conexion a PostgreSQL OK');
  } catch (err) {
    if (config.database.required) throw err;
    //con varias IPs (::1 y 127.0.0.1) pg lanza un AggregateError con message vacio
    const reason = (err as Error).message || (err as { code?: string }).code || String(err);
    logger.warn(` DB: sin conexion a PostgreSQL, el servidor arranca igual (DB_REQUIRED=false). Motivo: ${reason}`);
  }

  //inicializamos la app configurada
  const app = await createApp();

  //arrancamos el servidor HTTP
  const server = app.listen(config.port, () => {
    logger.info(` SERVER: ejecutAndose en http://localhost:${config.port}${config.api.prefix}`);
    logger.info(` ENTORNO: ${config.nodeEnv}`);
  });

  //cierre controlado
  const gracefulShutdown = (signal: string) => {
    logger.info(` SENIAL: ${signal} recibida. Iniciando cierre controlado del servidor...`);

    //deja de aceptar nuevas peticiones HTTP pero permite terminar las peticiones en curso
    server.close(async () => {
      logger.info('SERVIDOR: HTTP cerrado. Desconectando bases de datos y limpiando recursos...');
      pgp.end(); //cierra el pool de PostgreSQL
      logger.info('OK Proceso finalizado de forma limpia.');
      process.exit(0);
    });

    //fuerza la salida si las conexiones colgadas no se cierran en 10 segundos
    setTimeout(() => {
      logger.error('X Cierre forzado: Tiempo de espera agotado.');
      process.exit(1);
    }, 10000); //por si alguna peticion se queda colgada, forzamos
  };

  //capturamos las seniales del sistema para apagar el servidor sin cortar peticiones activas
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));//flags
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  //sigtem y sigint si recibimos esto, la app deja de recibir trafico nuevo pero espera a que finalicen las peticiiones activas
};

startServer().catch((err) => {
  logger.error(err, 'X Error fatal durante el arranque de la aplicación');
  process.exit(1);
});