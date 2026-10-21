import {Router} from 'express';
import pingRoutes from './modules/ping/ping.routes.ts';
const router = Router();

// registrar los modulos aca, swagger documenta lo que se monte en este archivo
router.use('/ping', pingRoutes);
export default router;
