
import {type Request, type Response, type NextFunction} from 'express';
import {AppError} from './AppError.ts';
import {logger} from '../../loaders/logger.ts';
import {config} from '../../config/index.ts';
import {type ApiErrorResponse} from '../../types/api.ts';

export const errorHandler = (
    err: Error | AppError, //err puede ser un error generico o un error de tipo AppError(el que definimos)
    _req: Request, //
    res: Response,
    _next: NextFunction
):void=>{
    let statusCode = 500;
    let message = 'Error interno del servidor';
    let isOperational = false;
    let errors: Record<string, string[]> | undefined = undefined;

    // si es un AppError conocido | debemos saber que es una instancia de ...
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
        errors = (err as any).errors; //as any para evitar error de typescript, ya que errors es opcional
    }
    //registramos el error en los logs
    if(!isOperational){
        logger.error(err, 'X Error no controlado');
    }else{
        logger.warn({statusCode, message}, 'ADVERTENCIA: Error operacional controlado');
    }

    const response: ApiErrorResponse = {
        success: false,
        statusCode,
        message,
        ...(errors && {errors}),
        ...(config.nodeEnv === 'development' && {stack: err.stack})
    };

    res.status(statusCode).json(response);

};