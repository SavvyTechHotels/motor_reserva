-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Añadir campo teléfono a bookings
-- Motor de Reservas SavvyTech
-- Ejecutar en: Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS telefono text;
