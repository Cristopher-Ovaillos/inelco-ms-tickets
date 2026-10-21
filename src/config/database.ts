/**
 * Conexion a PostgreSQL con pg-promise.
 * uso: import {db} from './config/database.ts'
 *      db.any('SELECT * FROM tickets WHERE id = $1', [id])
 */

import pgPromise from 'pg-promise';
import { config } from './index.ts';

export const pgp = pgPromise();

export const db = pgp({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    max: 10,
    idleTimeoutMillis: 30000
});

// pg-promise abre conexiones bajo demanda, asi que probamos una al arrancar
export const checkDbConnection = async () => {
    const conn = await db.connect();
    conn.done(); // devuelve la conexion al pool
};
