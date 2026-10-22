import {Router} from 'express';
import pingRoutes from './modules/ping/ping.routes.ts';
import consultaRoutes from './modules/consultas/consulta.routes.ts';
const router = Router();

// registrar los modulos aca, swagger documenta lo que se monte en este archivo
router.use('/ping', pingRoutes);
router.use('/consultas', consultaRoutes);
export default router;
