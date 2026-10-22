import { type Request, type Response } from 'express';
import { sendSuccess } from '../../core/utils/responseHandler.ts';
import * as service from './consulta.service.ts';

export const crearTecnica = async (req: Request, res: Response) => {
    const consulta = await service.crearConsultaTecnica(req.body);
    sendSuccess(res, consulta, 201, 'Consulta técnica creada');
};
