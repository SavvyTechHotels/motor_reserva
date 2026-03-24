# Setup — Motor de Reservas Hotel

## Estructura de archivos

```
motor_reserva/
├── n8n/
│   ├── workflow-disponibilidad.json   ← Importar en n8n (GET /disponibilidad)
│   └── workflow-crear-reserva.json    ← Importar en n8n (POST /reservar)
└── widget/
    └── widget.html                    ← Widget embebible (frontend)
```

---

## 1. Airtable — Crear la base de datos

### Base: `Hotel Reservas`

#### Tabla: `Reservas`

| Campo             | Tipo Airtable       | Notas                              |
|-------------------|---------------------|------------------------------------|
| `nombre`          | Single line text    | Nombre del cliente                 |
| `email`           | Email               | Obligatorio                        |
| `servicio`        | Single select       | Opciones: `spa`, `restaurante`     |
| `fecha`           | Date                | Formato ISO: YYYY-MM-DD            |
| `hora`            | Single line text    | Formato: HH:MM (ej. `14:30`)       |
| `personas`        | Number              | Entero, mínimo 1                   |
| `confirmacion_id` | Single line text    | Generado por n8n (ej. `RES-ABC-1`) |
| `estado`          | Single select       | Opciones: `confirmada`, `cancelada`|

### Obtener IDs de Airtable
1. Ve a tu base → copia la URL: `https://airtable.com/appXXXXXXXXX/tblXXXXXX`
   - `appXXXXXXXXX` → es tu **Base ID**
   - `tblXXXXXX` → es tu **Table ID**

---

## 2. n8n — Importar workflows

### Pasos:
1. Entra en tu instancia de n8n
2. **Workflows** → **Import from File**
3. Importa `n8n/workflow-disponibilidad.json`
4. Importa `n8n/workflow-crear-reserva.json`

### Configurar credenciales en cada workflow:

#### Nodos Airtable (aparecen 2-3 veces por workflow):
- Haz clic en el nodo → **Credentials** → Selecciona o crea `Airtable Token API`
- Reemplaza `YOUR_AIRTABLE_BASE_ID` con tu Base ID (`appXXXXXX`)
- Reemplaza `YOUR_TABLE_RESERVAS_ID` con tu Table ID (`tblXXXXXX`)

#### Nodo Gmail (`Enviar Email Confirmación` en workflow-crear-reserva):
- Haz clic en el nodo → **Credentials** → Selecciona o crea `Gmail OAuth2`
- Sigue el flujo de autorización de Google

### Activar workflows:
- Cada workflow importado viene **inactivo**
- Actívalo con el toggle en la esquina superior derecha

### URLs de los webhooks:
Una vez activos, los webhooks tendrán estas URLs:
```
GET  https://TU-N8N.com/webhook/disponibilidad?servicio=spa&fecha=2025-01-15
POST https://TU-N8N.com/webhook/reservar
```

---

## 3. Widget — Configurar y embeber

### Configuración (en `widget/widget.html`, línea ~450):
```javascript
const config = {
  apiBase: 'https://TU-N8N.com/webhook',  // ← cambia esto
  endpoints: {
    disponibilidad: '/disponibilidad',
    reservar:       '/reservar'
  }
};
```

### Embeber en tu web (opción A — página standalone):
Sirve `widget.html` directamente o inclúyelo en un `<iframe>`.

### Embeber en tu web (opción B — insertar en página existente):
Copia el bloque `<style>`, el `<div id="hotel-widget">` y el `<script>` de `widget.html`
e insértalos en tu página donde quieras que aparezca el widget.

### Personalizar colores (variables CSS al inicio de `<style>`):
```css
:root {
  --hrw-primary:  #1a1a2e;   /* Color oscuro principal */
  --hrw-accent:   #d4af6a;   /* Dorado / acento         */
  --hrw-bg:       #f9f7f4;   /* Fondo general           */
}
```

---

## 4. Reglas de negocio configuradas

| Servicio     | Intervalo | Horario       | Aforo máx/slot |
|--------------|-----------|---------------|----------------|
| Spa          | 60 min    | 10:00 – 20:00 | 4 personas     |
| Restaurante  | 30 min    | 12:00 – 23:00 | 20 personas    |

Para cambiar estos valores: editar el nodo **"Generar Slots"** en ambos workflows
y la función **"Calcular Aforo"** en `workflow-crear-reserva.json`.

---

## 5. CORS

Los webhooks de n8n devuelven `Access-Control-Allow-Origin: *` por defecto.
Para restringirlo a tu dominio, cambia `"*"` por `"https://tu-dominio.com"`
en los nodos `respondToWebhook` de ambos workflows.
