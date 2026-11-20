-- Agente de WhatsApp para agendar citas (salón de uñas) - DHR Calidad
-- Pega este archivo completo en Supabase → SQL Editor → Run.
-- Crea las tablas de la agenda y de las conversaciones.
-- Nadie desde internet puede leerlas: solo el agente, con la llave secreta (service role).

create extension if not exists btree_gist;

-- Datos generales del negocio (una sola fila)
create table if not exists salon (
  id            int primary key default 1 check (id = 1),
  nombre        text not null,
  direccion     text,
  zona_horaria  text not null default 'America/Mexico_City',
  notas         text            -- políticas: anticipo, tolerancia, cancelaciones, etc.
);

create table if not exists servicios (
  id          serial primary key,
  nombre      text not null,
  duracion_min int  not null check (duracion_min between 10 and 480),
  precio      numeric(10,2) not null check (precio >= 0),
  descripcion text,
  activo      boolean not null default true
);

create table if not exists empleadas (
  id      serial primary key,
  nombre  text not null,
  activa  boolean not null default true
);

-- Horario de apertura por día de la semana (0 = domingo ... 6 = sábado).
-- Si un día no tiene fila, ese día el salón está cerrado.
create table if not exists horarios (
  dia_semana int  primary key check (dia_semana between 0 and 6),
  abre       time not null,
  cierra     time not null check (cierra > abre)
);

create table if not exists citas (
  id             serial primary key,
  fecha          date not null,
  inicio         time not null,
  fin            time not null check (fin > inicio),
  servicio_id    int  not null references servicios(id),
  empleada_id    int  not null references empleadas(id),
  cliente_nombre text not null,
  cliente_tel    text not null,
  estado         text not null default 'confirmada' check (estado in ('confirmada','cancelada')),
  recordatorio_enviado boolean not null default false,
  creada         timestamptz not null default now(),
  -- Candado: una empleada nunca puede tener dos citas confirmadas que se encimen,
  -- aunque dos clientas escriban al mismo tiempo.
  constraint sin_empalmes exclude using gist (
    empleada_id with =,
    tsrange(fecha + inicio, fecha + fin) with &&
  ) where (estado = 'confirmada')
);
alter table citas add column if not exists recordatorio_enviado boolean not null default false;
create index if not exists citas_por_fecha on citas (fecha) where estado = 'confirmada';
create index if not exists citas_por_tel   on citas (cliente_tel, fecha);

-- Historial de la conversación de cada número (para que el agente recuerde el contexto)
create table if not exists mensajes (
  id        bigserial primary key,
  telefono  text not null,
  rol       text not null check (rol in ('cliente','agente')),
  texto     text not null,
  wa_id     text unique,        -- id de WhatsApp: evita contestar dos veces el mismo mensaje
  creado    timestamptz not null default now()
);
create index if not exists mensajes_por_tel on mensajes (telefono, creado desc);

-- Casos que necesitan a una persona (quejas, dudas que el agente no sabe, etc.)
create table if not exists avisos (
  id        bigserial primary key,
  telefono  text not null,
  nombre    text,
  motivo    text not null,
  atendido  boolean not null default false,
  creado    timestamptz not null default now()
);

-- Seguridad: activar RLS sin políticas = nadie con la llave pública puede leer ni escribir.
alter table salon     enable row level security;
alter table servicios enable row level security;
alter table empleadas enable row level security;
alter table horarios  enable row level security;
alter table citas     enable row level security;
alter table mensajes  enable row level security;
alter table avisos    enable row level security;
