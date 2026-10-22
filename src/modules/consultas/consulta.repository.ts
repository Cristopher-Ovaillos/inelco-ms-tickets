import { db } from '../../config/database.ts';
import { type CrearConsultaTecnicaDto } from './consulta.schema.ts';

export interface ConsultaRow {
    id: number;
    cliente_id: string | null;
    empleado_id: string | null;
    topico_id: number;
    prioridad_id: number;
    estado: string;
    descripcion: string;
    fecha_creacion: Date;
}

export interface ConsultaTecnicaRow {
    sistema_externo_id: string;
    datos_sistema_cache: unknown;
}

// dos inserts en una transaccion: si falla el segundo, el primero se deshace
export const crearConsultaTecnica = (dto: CrearConsultaTecnicaDto, datosSistema: object) =>
    db.tx(async (t) => {
        const consulta = await t.one<ConsultaRow>(
            `INSERT INTO consultas (cliente_id, topico_id, prioridad_id, descripcion)
             VALUES ($1, $2, $3, $4)
             RETURNING id, cliente_id, empleado_id, topico_id, prioridad_id, estado, descripcion, fecha_creacion`,
            [dto.cliente_id, dto.topico_id, dto.prioridad_id, dto.descripcion]
        );

        // el :json hace que pg-promise mande el objeto como json a la columna jsonb
        const tecnica = await t.one<ConsultaTecnicaRow>(
            `INSERT INTO consultas_tecnicas (consulta_id, sistema_externo_id, datos_sistema_cache)
             VALUES ($1, $2, $3:json)
             RETURNING sistema_externo_id, datos_sistema_cache`,
            [consulta.id, dto.sistema_externo_id, datosSistema]
        );

        return { consulta, tecnica };
    });
