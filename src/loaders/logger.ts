//utilizaremos pino, tiene salida estructurada json
//consola, y si hay LOG_FILE tambien a archivo

import path from 'node:path';
import pino from 'pino';
import {config} from '../config/index.ts';

const {level, file} = config.logs;
const isDev = config.nodeEnv === 'development';

const targets: pino.TransportTargetOptions[] = [];
if (isDev) {
    targets.push({target: 'pino-pretty', level, options: {colorize: true}});
} else if (file) {
    targets.push({target: 'pino/file', level, options: {destination: 1}}); //1 = stdout
}
if (file) {
    targets.push({target: 'pino/file', level, options: {destination: path.resolve(file), mkdir: true}});
}

export const logger = targets.length
    ? pino({level}, pino.transport({targets}))
    : pino({level});
