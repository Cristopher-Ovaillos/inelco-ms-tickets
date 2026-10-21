/*
  base de tickets (consultas, soluciones, reasignaciones)

  la base se crea aparte, una sola vez:
    psql -U postgres -c "CREATE DATABASE inelco_tickets_db"

  y despues se corre este script dentro de ella:
    psql -U postgres -d inelco_tickets_db -f inelco_tickets_db.sql

  desde psql tambien sirve: \c inelco_tickets_db y luego \i inelco_tickets_db.sql
  se puede ejecutar varias veces, las tablas y los datos iniciales no se duplican
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


/*
  catalogos fijos

  topicos agrupa de que trata la consulta y se puede apagar con activo sin borrarlo.
  prioridades y estados son listas cortas que casi no cambian, pero viven en tabla
  y no en un check porque las consultas los referencian por id.
*/
CREATE TABLE IF NOT EXISTS topicos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS prioridades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS estados_consulta (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);


/*
  consulta: entidad base

  junta lo que comparten todas las consultas, sean tecnicas o comerciales. lo propio
  de cada tipo va en su subclase para no llenar esta tabla de columnas casi siempre nulas.

  cliente_id y empleado_id apuntan a usuarios de inelco_users_db. no llevan fk porque
  es otra base, la relacion es solo logica. cliente_id puede ser null cuando consulta
  alguien sin cuenta (comercial), y empleado_id se completa recien cuando se asigna.

  estado_id arranca en 1, que es abierta (ver los inserts de mas abajo).
  la calificacion la carga el cliente al final, de 1 a 5.
*/
CREATE TABLE IF NOT EXISTS consultas (
    id SERIAL PRIMARY KEY,
    cliente_id UUID NULL,
    empleado_id UUID NULL,
    topico_id INTEGER NOT NULL REFERENCES topicos(id),
    prioridad_id INTEGER NOT NULL REFERENCES prioridades(id),
    estado_id INTEGER NOT NULL DEFAULT 1 REFERENCES estados_consulta(id),
    descripcion TEXT NOT NULL,
    fue_autogestionada BOOLEAN DEFAULT FALSE,
    intervencion_ia BOOLEAN DEFAULT FALSE,
    veces_reabierta INTEGER DEFAULT 0,
    calificacion_atencion INTEGER CHECK (calificacion_atencion BETWEEN 1 AND 5),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP WITH TIME ZONE NULL
);


/*
  subclase tecnica

  datos_sistema_cache es jsonb y no un conjunto de columnas porque lo que llega depende
  del equipo y de la version del sistema externo: las variables van cambiando y no hay
  un formato fijo al que atarse. jsonb guarda la foto tal cual llega al abrir la consulta,
  y aun asi se puede filtrar por clave (datos_sistema_cache->>'modelo') o indexar con gin,
  sin migrar la tabla cada vez que aparece un dato nuevo.
*/
CREATE TABLE IF NOT EXISTS consultas_tecnicas (
    consulta_id INTEGER PRIMARY KEY REFERENCES consultas(id) ON DELETE CASCADE,
    sistema_externo_id VARCHAR(100) NOT NULL,
    datos_sistema_cache JSONB NULL
);


/*
  subclase comercial

  los datos guest_* son opcionales: si el cliente esta registrado ya se tienen en
  users, y solo se piden cuando consulta un invitado.
*/
CREATE TABLE IF NOT EXISTS consultas_comerciales (
    consulta_id INTEGER PRIMARY KEY REFERENCES consultas(id) ON DELETE CASCADE,
    guest_nombre VARCHAR(100) NULL,
    guest_email VARCHAR(150) NULL,
    guest_telefono VARCHAR(50) NULL,
    derivada_a_ventas BOOLEAN DEFAULT FALSE
);


/*
  soluciones

  origen, estado y tipo usan check y no tabla aparte: son pocos valores y casi nunca
  cambian. es_publica marca las que pueden pasar a la base de conocimiento.
*/
CREATE TABLE IF NOT EXISTS soluciones (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    empleado_id UUID NOT NULL,
    descripcion TEXT NOT NULL,
    origen VARCHAR(50) NOT NULL CHECK (origen IN ('ia', 'tecnico', 'base_conocimiento')),
    estado_solucion VARCHAR(50) NOT NULL DEFAULT 'propuesta' CHECK (estado_solucion IN ('propuesta', 'aplicada', 'verificada', 'fallida')),
    tipo_solucion VARCHAR(50) NOT NULL CHECK (tipo_solucion IN ('temporal', 'definitiva', 'parche')),
    es_publica BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


/*
  historial de reasignaciones

  cada cambio de tecnico es una fila nueva, asi no se pierde quien tuvo la consulta
  antes. tecnico_origen_id es null en la primera asignacion.
*/
CREATE TABLE IF NOT EXISTS reasignaciones_tecnico (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    tecnico_origen_id UUID NULL,
    tecnico_destino_id UUID NOT NULL,
    motivo TEXT NOT NULL,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


/*
  datos iniciales

  hacen falta para que el sistema arranque: sin la fila 'Abierta' como id 1, el default
  de consultas.estado_id no tiene a que apuntar. por eso el orden de los estados importa.
  on conflict permite volver a correr el script sin duplicar nada.
  los topicos son de ejemplo, ajustarlos a lo que realmente atiende inelco.
*/
INSERT INTO estados_consulta (nombre) VALUES
    ('Abierta'),
    ('En Progreso'),
    ('Resuelta'),
    ('Cerrada')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO prioridades (nombre) VALUES
    ('Baja'),
    ('Media'),
    ('Alta'),
    ('Critica')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO topicos (nombre, descripcion) VALUES
    ('Falla de equipo', 'el equipo no funciona o funciona mal'),
    ('Software', 'errores, configuracion o actualizacion del sistema'),
    ('Red y conectividad', 'problemas de conexion con el equipo o el servidor'),
    ('Presupuesto y ventas', 'cotizaciones y consultas comerciales'),
    ('Otros', 'cualquier consulta que no entre en las anteriores')
ON CONFLICT (nombre) DO NOTHING;
