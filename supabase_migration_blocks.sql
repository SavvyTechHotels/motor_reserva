-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Time-Blocking — hora_fin en bookings
-- Motor de Reservas SavvyTech
-- Ejecutar en: Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Añadir hora_fin a bookings ─────────────────────────────────
-- Necesario para detectar solapamientos entre reservas.
-- Si un cliente reserva a las 15:00 con duración 120 min,
-- hora_fin = 17:00. Cualquier nueva reserva entre 15:00 y 17:00
-- reduce la capacidad disponible.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hora_fin time;

-- ── 2. Retrocompatibilidad: calcular hora_fin de reservas existentes ──
-- Requiere join con services para obtener la duración.
-- Ejecutar SOLO si quieres rellenar reservas previas.
-- (Opcional — las nuevas reservas ya guardarán hora_fin automáticamente)
/*
UPDATE bookings b
SET hora_fin = (b.hora + (s.duracion || ' minutes')::interval)::time
FROM services s
WHERE b.service_id = s.id
  AND b.hora_fin IS NULL
  AND b.hora IS NOT NULL;
*/
