-- Datos de EJEMPLO para probar. Cámbialos por los del salón real.
insert into salon (id, nombre, direccion, zona_horaria, notas) values
  (1, 'Salón de Uñas Demo', 'Av. Ejemplo 123, Col. Centro', 'America/Mexico_City',
   'Tolerancia de 10 minutos. Para cancelar, avisar con al menos 3 horas. Pago en efectivo o tarjeta.')
on conflict (id) do update set nombre = excluded.nombre, direccion = excluded.direccion, notas = excluded.notas;

insert into servicios (nombre, duracion_min, precio, descripcion) values
  ('Manicure clásico',        45, 250, 'Limado, cutícula, hidratación y esmalte normal'),
  ('Gelish en manos',         60, 350, 'Esmalte semipermanente, dura 2 a 3 semanas'),
  ('Uñas acrílicas (set)',   120, 650, 'Set completo de acrílico con diseño sencillo'),
  ('Retoque de acrílico',     90, 450, 'Relleno de acrílico de 2 a 3 semanas'),
  ('Pedicure spa',            60, 380, 'Exfoliación, masaje y esmalte');

insert into empleadas (nombre) values ('Karla'), ('Lupita'), ('Fer');

insert into horarios (dia_semana, abre, cierra) values
  (1, '10:00', '20:00'),  -- lunes
  (2, '10:00', '20:00'),
  (3, '10:00', '20:00'),
  (4, '10:00', '20:00'),
  (5, '10:00', '20:00'),  -- viernes
  (6, '09:00', '18:00')   -- sábado
on conflict (dia_semana) do update set abre = excluded.abre, cierra = excluded.cierra;
-- domingo (0) cerrado
