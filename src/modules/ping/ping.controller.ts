import {type Request, type Response} from 'express';
import {sendSuccess} from '../../core/utils/responseHandler.ts';

export const ping = (_req: Request, res: Response) => {
    sendSuccess(res, {pong: true, timestamp: new Date().toISOString()});
};
