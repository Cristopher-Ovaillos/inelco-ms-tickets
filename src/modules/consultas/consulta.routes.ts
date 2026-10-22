import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.ts';
import { validateRequest } from '../../core/middlewares/validateRequest.ts';
import { crearConsultaTecnicaSchema } from './consulta.schema.ts';
import { crearTecnica } from './consulta.controller.ts';

const router = Router();

router.post('/tecnicas', validateRequest(crearConsultaTecnicaSchema), asyncHandler(async (req, res) => {
    // #swagger.tags = ['Consultas']
    // #swagger.summary = 'Crea una consulta técnica y guarda el clima del lugar como foto del sistema'
    /* #swagger.requestBody = {
        required: true,
        content: { 'application/json': { schema: {
            type: 'object',
            properties: {
                cliente_id: { type: 'string', example: 'id de un cliente de users' },
                topico_id: { type: 'integer', example: 1 },
                prioridad_id: { type: 'integer', example: 3 },
                descripcion: { type: 'string', example: 'La central de incendio marca falla de lazo' },
                sistema_externo_id: { type: 'string', example: 'CENTRAL-0042' },
                ubicacion: { type: 'object', properties: {
                    latitud: { type: 'number', example: -32.95 },
                    longitud: { type: 'number', example: -60.64 } } }
            }
        } } }
    } */
    // #swagger.responses[201] = { description: 'Consulta creada' }
    // #swagger.responses[400] = { description: 'Datos inválidos o tópico/prioridad inexistente' }
    return crearTecnica(req, res);
}));

export default router;
