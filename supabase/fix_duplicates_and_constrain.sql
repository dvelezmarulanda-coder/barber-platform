-- 1. IDENTIFICAR Y CANCELAR DUPLICADOS
-- Mantenemos válida la primera cita que se creó (la más antigua) y cancelamos las posteriores que chocarían.
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
            PARTITION BY barbero_id, fecha_hora 
            ORDER BY created_at ASC
         ) as row_num
  FROM citas
  WHERE estado != 'cancelada'
)
UPDATE citas
SET estado = 'cancelada'
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- 2. AHORA SÍ, CREAR EL CANDADO (ÍNDICE ÚNICO)
-- Como ya no hay duplicados activos, esto funcionará sin errores.
CREATE UNIQUE INDEX unique_active_appointment 
ON public.citas (barbero_id, fecha_hora) 
WHERE estado != 'cancelada';
