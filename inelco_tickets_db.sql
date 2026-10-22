/*
  base de consultas tecnicas y comerciales segun el MER (inelco_tickets_db)

  la base se crea aparte, una sola vez:
    psql -U postgres -c "CREATE DATABASE inelco_tickets_db"

  y despues se corre este script dentro de ella:
    psql -U postgres -d inelco_tickets_db -f inelco_tickets_db.sql

  se puede ejecutar varias veces, las tablas y los datos iniciales no se duplican
*/

/*
  enums del MER

  CREATE TYPE no tiene IF NOT EXISTS, por eso se captura el error si el tipo ya existe
  y asi el script se puede volver a correr.
*/
DO $$ BEGIN
    CREATE TYPE enum_estado_consulta AS ENUM ('abierta', 'en_progreso', 'cerrada');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_origen_solucion AS ENUM ('ia', 'tecnico', 'base_conocimiento');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_estado_solucion AS ENUM ('propuesta', 'aplicada', 'verificada', 'fallida');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_tipo_solucion AS ENUM ('temporal', 'definitiva', 'parche');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- catalogos
CREATE TABLE IF NOT EXISTS topicos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS prioridades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);


/*
  consulta: entidad base de la especializacion (ISA del MER)

  junta lo que comparten todas las consultas, sean tecnicas o comerciales. lo propio
  de cada tipo va en su subclase para no llenar esta tabla de columnas casi siempre nulas.

  cliente_id y empleado_id apuntan a inelco_users_db (clientes.id y empleados.id).
  no llevan fk porque es otra base: la relacion es solo logica (las entidades con * del MER).
  cliente_id puede ser null (consulta de un invitado) y empleado_id se completa al asignar.
*/
CREATE TABLE IF NOT EXISTS consultas (
    id SERIAL PRIMARY KEY,
    cliente_id UUID NULL,
    empleado_id UUID NULL,
    topico_id INTEGER NOT NULL REFERENCES topicos(id),
    prioridad_id INTEGER NOT NULL REFERENCES prioridades(id),
    estado enum_estado_consulta NOT NULL DEFAULT 'abierta',
    descripcion TEXT NOT NULL,
    fue_autogestionada BOOLEAN NOT NULL DEFAULT FALSE,
    intervencion_ia BOOLEAN NOT NULL DEFAULT FALSE,
    veces_reabierta INTEGER NOT NULL DEFAULT 0,
    calificacion_atencion INTEGER NULL CHECK (calificacion_atencion BETWEEN 1 AND 5),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMPTZ NULL
);


/*
  subclase tecnica

  datos_sistema_cache es jsonb y no un conjunto de columnas porque lo que llega depende
  del equipo y de la version del sistema externo: las variables van cambiando y no hay
  un formato fijo al que atarse. jsonb guarda la foto tal cual llega al abrir la consulta,
  y aun asi se puede filtrar por clave (datos_sistema_cache->>'modelo') o indexar con gin.
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
    derivada_a_ventas BOOLEAN NOT NULL DEFAULT FALSE
);


/*
  soluciones

  empleado_id puede ser null: una solucion propuesta por la ia no tiene empleado
  (relacion "elabora" parcial en el MER). es_publica marca las que pasan a la base
  de conocimiento.
*/
CREATE TABLE IF NOT EXISTS soluciones (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    empleado_id UUID NULL,
    descripcion TEXT NOT NULL,
    es_publica BOOLEAN NOT NULL DEFAULT FALSE,
    origen enum_origen_solucion NOT NULL,
    estado enum_estado_solucion NOT NULL DEFAULT 'propuesta',
    tipo enum_tipo_solucion NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


/*
  historial de reasignaciones

  cada cambio de tecnico es una fila nueva, asi no se pierde quien tuvo la consulta
  antes. tecnico_origen_id es null en la primera asignacion y el motivo es opcional.
*/
CREATE TABLE IF NOT EXISTS reasignaciones_tecnico (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    tecnico_origen_id UUID NULL,
    tecnico_destino_id UUID NOT NULL,
    motivo TEXT NULL,
    fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


/*
  datos iniciales

  solo los catalogos. los topicos son de ejemplo, ajustarlos a lo que realmente
  atiende inelco.
*/
INSERT INTO prioridades (nombre) VALUES
    ('Baja'),
    ('Media'),
    ('Alta'),
    ('Urgente')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO topicos (nombre, descripcion) VALUES
    ('Falla de equipo', 'el equipo no funciona o funciona mal'),
    ('Software', 'errores, configuracion o actualizacion del sistema'),
    ('Red y conectividad', 'problemas de conexion con el equipo o el servidor'),
    ('Presupuesto y ventas', 'cotizaciones y consultas comerciales'),
    ('Otros', 'cualquier consulta que no entre en las anteriores')
ON CONFLICT (nombre) DO NOTHING;
