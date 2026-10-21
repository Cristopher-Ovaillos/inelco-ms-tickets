import {Router} from 'express';
import {asyncHandler} from '../../core/utils/asyncHandler.ts';
import {ping} from './ping.controller.ts';

const router = Router();

// swagger-autogen lee los comentarios #swagger de adentro de la ruta
router.get('/', asyncHandler(async (req, res) => {
    // #swagger.tags = ['Ping']
    // #swagger.summary = 'Verifica que la API responde'
    return ping(req, res);
}));

export default router;
