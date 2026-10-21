//estandarizar respuestas https exitosas

import {type Response} from 'express';
import {type ApiSuccessResponse} from '../../types/api.ts';

export const sendSuccess =<T>(
    res:Response,
    data:T,
    statusCode:number=200,
    message?:string
):Response =>{
    const response: ApiSuccessResponse<T> = {
        success: true,
        ...(message && {message}),
        data,
    };
    return res.status(statusCode).json(response);
}