# Motor de Reservas para Hoteles — CLAUDE.md

## Descripción del Proyecto

Widget frontend (JS/HTML/CSS) + backend orquestado en n8n, conectados mediante webhooks.
Sectores cubiertos: **Spa** y **Restauración**.

Claude construye de forma sincronizada:
- El código del widget embebible
- Los flujos de trabajo en n8n (via MCP de n8n)

---

## Arquitectura General

```
[Widget Hotel]
    │
    ├──► GET  /webhook/disponibilidad?servicio=spa&fecha=YYYY-MM-DD
    │         └─► n8n consulta Supabase/Airtable → devuelve slots libres
    │
    └──► POST /webhook/reserva
              └─► n8n valida aforo → guarda reserva → envía email de confirmación
```

---

## Habilidades de Claude en este Proyecto

### 1. Gestión de Disponibilidad por Intervalos
- Crear flujos n8n que consulten Supabase o Airtable
- Filtrar por `servicio` (spa | restaurante) y `fecha`
- Devolver array de slots de tiempo libres al widget

### 2. Procesamiento de Reservas con Email
- Configurar nodo Webhook en n8n para recibir:
  - `nombre`, `email` (obligatorio), `servicio`, `fecha`, `hora`, `personas`
- Enviar confirmación automática via Gmail o SendGrid

### 3. Validación Anti-Overbooking
- n8n verifica `aforo_actual < aforo_maximo` antes de confirmar
- Si no hay hueco: respuesta de error clara al widget

---

## Stack Técnico

| Capa       | Tecnología               |
|------------|--------------------------|
| Frontend   | HTML + CSS + Vanilla JS  |
| Backend    | n8n (self-hosted)        |
| Base datos | Supabase o Airtable      |
| Email      | Gmail / SendGrid         |
| Integración| MCP de n8n               |

---

## Convenciones de Desarrollo

- El widget debe ser **embebible** (un único `<script>` tag o bloque HTML autocontenido)
- Los webhooks de n8n deben devolver JSON limpio con estructura consistente:
  ```json
  { "ok": true, "data": [...] }
  { "ok": false, "error": "mensaje legible" }
  ```
- Nunca confirmar una reserva sin validar aforo primero
- El campo `email` es **siempre obligatorio** en el formulario y en el webhook
- Los flujos n8n se crean/editan directamente via MCP cuando el usuario lo solicite

---

## Flujos n8n Planificados

1. **`disponibilidad`** — GET webhook → consulta BD → retorna slots
2. **`crear-reserva`** — POST webhook → valida aforo → guarda → envía email
3. *(Futuro)* **`cancelar-reserva`** — POST webhook → libera slot → notifica

---

## Recursos y Herramientas Externas

### MCP Server — n8n-mcp
- **Repo:** https://github.com/czlonkowski/n8n-mcp
- **Config:** `.mcp.json` en la raíz del proyecto (ya configurado con `npx n8n-mcp`)
- **Variables de entorno requeridas:** `N8N_API_URL` y `N8N_API_KEY`
- **Herramientas clave disponibles:**
  - `n8n_create_workflow` — crear flujos nuevos
  - `n8n_update_partial_workflow` — editar flujos existentes
  - `n8n_test_workflow` — ejecutar y probar
  - `search_nodes` / `get_node` — explorar nodos disponibles
  - `search_templates` — buscar workflows de referencia (2.709 templates)

### Skills — n8n-skills
- **Repo:** https://github.com/czlonkowski/n8n-skills
- **Instalación:** `/plugin install czlonkowski/n8n-skills`
- **7 skills activos** que Claude aplica automáticamente:
  1. Expression Syntax (`{{}}`, `$json`, `$node`, `$now`)
  2. MCP Tools Expert (selección de nodos, validación)
  3. Workflow Patterns (5 arquitecturas probadas de 2.653+ templates)
  4. Validation Expert (diagnóstico de errores)
  5. Node Configuration (dependencias entre propiedades)
  6. Code JavaScript (acceso a datos, `[{json: {...}}]`, `$helpers.httpRequest()`)
  7. Code Python (limitaciones documentadas)
- **Nota crítica:** los datos de webhook están en `$json.body`, no en `$json`

### Patrones n8n aplicables a este proyecto
- Datos de webhook: `$json.body.email`, `$json.body.servicio`, etc.
- Retorno correcto en nodos Code: `return [{json: {ok: true, data: slots}}]`
- JS cubre ~95% de casos; usar Python solo si es imprescindible

---

## Notas de Contexto

- El usuario acciona la creación de flujos n8n mediante prompts explícitos
- Claude usa el MCP de n8n para crear, editar y desplegar flujos directamente
- La integración es bidireccional: el widget consume los webhooks que Claude configura en n8n
- Antes de modificar cualquier flujo en producción: hacer copia de seguridad
