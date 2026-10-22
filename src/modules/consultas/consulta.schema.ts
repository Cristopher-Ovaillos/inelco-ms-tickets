import { z } from 'zod';

export const crearConsultaTecnicaSchema = z.object({
    body: z.object({
        cliente_id: z.uuid('cliente_id inválido'),
        topico_id: z.number('topico_id debe ser un número').int().positive(),
        prioridad_id: z.number('prioridad_id debe ser un número').int().positive(),
        descripcion: z.string().min(1, 'La descripción es obligatoria').max(2000),
        sistema_externo_id: z.string().min(1, 'El sistema es obligatorio').max(100),
        ubicacion: z.object({
            latitud: z.number().min(-90).max(90),
            longitud: z.number().min(-180).max(180),
        }).optional(),
    }),
});

export type CrearConsultaTecnicaDto = z.infer<typeof crearConsultaTecnicaSchema>['body'];
