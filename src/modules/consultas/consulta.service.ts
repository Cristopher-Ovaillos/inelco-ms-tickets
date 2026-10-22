import { AppError } from '../../core/errors/AppError.ts';
import { type CrearConsultaTecnicaDto } from './consulta.schema.ts';
import * as repository from './consulta.repository.ts';
import { obtenerClima } from './clima.client.ts';
import { toConsultaTecnicaDto } from './consulta.mapper.ts';

export const crearConsultaTecnica = async (dto: CrearConsultaTecnicaDto) => {
    const clima = dto.ubicacion
        ? await obtenerClima(dto.ubicacion.latitud, dto.ubicacion.longitud)
        : null;

    // se guarda tal cual: el tecnico ve el clima de cuando se hizo el reclamo
    const datosSistema = {
        ubicacion: dto.ubicacion ?? null,
        clima,
        obtenido_en: new Date().toISOString(),
    };

    try {
        const { consulta, tecnica } = await repository.crearConsultaTecnica(dto, datosSistema);
        return toConsultaTecnicaDto(consulta, tecnica);
    } catch (error) {
        // 23503 = clave foranea: no existe el topico o la prioridad.
        // cliente_id no se chequea porque vive en la base de users
        if ((error as { code?: string }).code === '23503') {
            const constraint = (error as { constraint?: string }).constraint ?? '';
            const campo = constraint.includes('topico') ? 'topico_id' : 'prioridad_id';
            throw new AppError('Error de validación', 400, true, { [campo]: [`No existe ese ${campo}`] });
        }
        throw error;
    }
};
