-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Catálogo de Servicios por Establecimiento
-- Motor de Reservas SavvyTech
-- Ejecutar en: Supabase > SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Tabla services ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id uuid       NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  nombre          text        NOT NULL,
  slug            text        UNIQUE NOT NULL,  -- e.g. "masaje-relax", "cena-romantica"
  descripcion     text,
  duracion        integer     DEFAULT 60,        -- minutos
  aforo_max       integer     DEFAULT 10,
  precio          numeric(10,2),
  color_accent    text        DEFAULT '#0e4159', -- color de acento del widget para este servicio
  activo          boolean     DEFAULT true,
  horario         jsonb,       -- {"lun":["09:00","18:00"],"mar":["09:00","18:00"],...}
                               -- NULL = hereda horario del establecimiento
  intervalo_min   integer     DEFAULT 60,
  foto_url        text,
  created_at      timestamptz DEFAULT now()
);

-- ── 2. Tabla inventory_custom ────────────────────────────────────────
-- Permite controlar el aforo disponible para un servicio en fecha/hora específica.
-- Anula el valor de services.aforo_max para esa combinación concreta.
CREATE TABLE IF NOT EXISTS inventory_custom (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id      uuid        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  fecha           date        NOT NULL,
  hora            time,        -- NULL = aplica a todo el día
  aforo_disponible integer    NOT NULL,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(service_id, fecha, hora)
);

-- ── 3. Añadir service_id a bookings ──────────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES services(id);

-- ── 4. Índices de rendimiento ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_services_slug            ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_establishment   ON services(establishment_id);
CREATE INDEX IF NOT EXISTS idx_services_activo          ON services(activo);
CREATE INDEX IF NOT EXISTS idx_inventory_svc_fecha      ON inventory_custom(service_id, fecha);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id      ON bookings(service_id);

-- ── 5. Row Level Security ─────────────────────────────────────────────
ALTER TABLE services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_custom ENABLE ROW LEVEL SECURITY;

-- Lectura pública de servicios activos (widget usa anon key)
CREATE POLICY "anon_read_active_services"
  ON services FOR SELECT
  USING (activo = true);

-- Lectura pública de inventory_custom (para calcular disponibilidad)
CREATE POLICY "anon_read_inventory_custom"
  ON inventory_custom FOR SELECT
  USING (true);

-- Acceso completo para usuarios autenticados (admin panel)
CREATE POLICY "authenticated_all_services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_all_inventory_custom"
  ON inventory_custom FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Acceso completo con service_role (para n8n con service key)
CREATE POLICY "service_role_all_services"
  ON services FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_inventory_custom"
  ON inventory_custom FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
