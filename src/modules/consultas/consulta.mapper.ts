import { type ConsultaRow, type ConsultaTecnicaRow } from './consulta.repository.ts';

export const toConsultaTecnicaDto = (consulta: ConsultaRow, tecnica: ConsultaTecnicaRow) => ({
    id: consulta.id,
    cliente_id: consulta.cliente_id,
    empleado_id: consulta.empleado_id,
    topico_id: consulta.topico_id,
    prioridad_id: consulta.prioridad_id,
    estado: consulta.estado,
    descripcion: consulta.descripcion,
    fecha_creacion: consulta.fecha_creacion.toISOString(),
    sistema_externo_id: tecnica.sistema_externo_id,
    datos_sistema_cache: tecnica.datos_sistema_cache,
});
