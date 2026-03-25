(function () {
  'use strict';

  /* ─── Configuración ──────────────────────────────────────────────── */
  const API_BASE = 'https://vmi3024621.contaboserver.net/webhook';

  const _scriptEl = document.currentScript || document.querySelector('script[src*="widget-reservas"]');
  let SERVICE_SLUG = null;
  try {
    const _u = new URL(_scriptEl ? _scriptEl.src : '');
    SERVICE_SLUG = _u.searchParams.get('service_slug');
  } catch {}

  /* ─── Config del establecimiento ─────────────────────────────────── */
  let config = {
    service_id: null,
    nombre: '',
    establishment_nombre: '',
    duracion: null,
    precio: null,
    color_primary: '#0e4159',
    color_accent:  '#0e4159',
    color_secondary: '#f6f3f1',
    logo_url: '',
  };

  /* ─── Fuente Inter vía Google Fonts ──────────────────────────────── */
  const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';

  /* ─── Estilos SavvyTech ──────────────────────────────────────────── */
  const CSS = `
    @import url('${FONT_LINK}');

    .hr-widget * { box-sizing: border-box; margin: 0; padding: 0; }
    .hr-widget {
      --hr-primary:   #0e4159;
      --hr-accent:    #0e4159;
      --hr-secondary: #f9f8f7;
      --hr-surface:   #ffffff;
      --hr-text:      #111827;
      --hr-muted:     #9ca3af;
      --hr-border:    #e5e7eb;
      --hr-radius:    0px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      max-width: 420px;
      margin: 0 auto;
      background: var(--hr-surface);
      border-radius: 0;
      box-shadow: 0 2px 24px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04);
      overflow: hidden;
    }

    /* ── Header ── */
    .hr-header {
      background: var(--hr-primary);
      padding: 28px 32px 22px;
      color: #fff;
      position: relative;
    }
    .hr-header-top {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    .hr-logo-wrap {
      height: 30px;
      max-width: 120px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .hr-logo {
      max-height: 100%;
      max-width: 100%;
      width: auto;
      object-fit: contain;
      filter: brightness(0) invert(1);
      opacity: .9;
      display: block;
    }
    .hr-logo-placeholder {
      font-size: .72rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,.75);
      line-height: 1;
    }
    .hr-header h2 {
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: .1px;
    }
    .hr-header p {
      font-size: .75rem;
      opacity: .5;
      margin-top: 3px;
      font-weight: 400;
      letter-spacing: .2px;
    }
    .hr-tipo-badge {
      display: none;
    }
    .hr-steps {
      display: flex;
      gap: 3px;
    }
    .hr-step-dot {
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,.2);
      transition: background .35s;
    }
    .hr-step-dot.active { background: rgba(255,255,255,.8); }

    /* ── Body ── */
    .hr-body { padding: 28px 32px 32px; background: var(--hr-surface); }

    /* ── Labels / Fields ── */
    .hr-label {
      display: block;
      font-size: .68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--hr-muted);
      margin-bottom: 8px;
    }
    .hr-field { margin-bottom: 18px; }
    .hr-input {
      width: 100%;
      padding: 11px 0;
      border: none;
      border-bottom: 1.5px solid var(--hr-border);
      border-radius: 0;
      font-size: .93rem;
      font-family: inherit;
      color: var(--hr-text);
      background: transparent;
      transition: border-color .2s;
      outline: none;
      appearance: none;
    }
    .hr-input:focus {
      border-bottom-color: var(--hr-primary);
    }

    /* ── Slots ── */
    .hr-slots-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 24px;
    }
    .hr-slot {
      border: 1px solid var(--hr-border);
      border-radius: 0;
      padding: 14px 6px;
      text-align: center;
      cursor: pointer;
      transition: border-color .15s, background .15s;
      background: var(--hr-surface);
    }
    .hr-slot:hover {
      border-color: var(--hr-primary);
      background: var(--hr-secondary);
    }
    .hr-slot.selected {
      border-color: var(--hr-primary);
      background: var(--hr-primary);
    }
    .hr-slot.selected .hora { color: #fff; }
    .hr-slot.selected .plazas { color: rgba(255,255,255,.6); }
    .hr-slot .hora { font-size: .9rem; font-weight: 600; color: var(--hr-text); letter-spacing: .2px; }
    .hr-slot .plazas { font-size: .65rem; color: var(--hr-muted); margin-top: 4px; letter-spacing: .3px; }
    .hr-slot.pocas .plazas { color: #d97706; }
    .hr-empty {
      text-align: center;
      padding: 32px 0;
      color: var(--hr-muted);
      font-size: .85rem;
      line-height: 1.7;
    }

    /* ── Botones ── */
    .hr-btn {
      width: 100%;
      padding: 14px;
      background: var(--hr-primary);
      color: #fff;
      border: none;
      border-radius: 0;
      font-size: .88rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      letter-spacing: .6px;
      text-transform: uppercase;
      transition: opacity .2s;
    }
    .hr-btn:hover:not(:disabled) { opacity: .85; }
    .hr-btn:active:not(:disabled) { opacity: .95; }
    .hr-btn:disabled { opacity: .3; cursor: not-allowed; }

    .hr-btn-back {
      background: none;
      border: none;
      color: var(--hr-muted);
      font-size: .78rem;
      font-family: inherit;
      cursor: pointer;
      margin-bottom: 22px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      letter-spacing: .4px;
      text-transform: uppercase;
      transition: color .15s;
    }
    .hr-btn-back:hover { color: var(--hr-text); }

    /* ── Error ── */
    .hr-error {
      background: transparent;
      border-left: 2px solid #ef4444;
      color: #b91c1c;
      padding: 8px 12px;
      font-size: .82rem;
      margin-bottom: 18px;
    }

    /* ── Skeleton loaders ── */
    @keyframes hr-shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .hr-skeleton {
      border-radius: 0;
      background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
      background-size: 800px 100%;
      animation: hr-shimmer 1.4s infinite linear;
    }
    .hr-skeleton-slots {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 24px;
    }
    .hr-skeleton-slot { height: 60px; }
    .hr-skeleton-btn { height: 48px; margin-top: 4px; }

    /* ── Loading spinner ── */
    .hr-loading {
      text-align: center;
      padding: 8px 0 16px;
      color: var(--hr-muted);
      font-size: .88rem;
    }
    .hr-spinner {
      display: block;
      margin: 0 auto 10px;
      width: 20px; height: 20px;
      border: 1.5px solid rgba(0,0,0,.08);
      border-top-color: var(--hr-primary);
      border-radius: 50%;
      animation: hr-spin .7s linear infinite;
    }
    @keyframes hr-spin { to { transform: rotate(360deg); } }

    /* ── Éxito ── */
    .hr-success {
      text-align: center;
      padding: 8px 0 4px;
    }
    .hr-success-icon {
      width: 48px; height: 48px;
      background: transparent;
      border: 1.5px solid var(--hr-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 1.2rem;
      color: var(--hr-primary);
    }
    .hr-success h3 { font-size: 1rem; font-weight: 600; color: var(--hr-text); margin-bottom: 6px; letter-spacing: .1px; }
    .hr-success p { font-size: .83rem; color: var(--hr-muted); line-height: 1.6; }

    .hr-resumen {
      background: var(--hr-secondary);
      border: none;
      border-top: 1px solid var(--hr-border);
      border-bottom: 1px solid var(--hr-border);
      padding: 16px 0;
      margin: 20px 0;
      text-align: left;
    }
    .hr-resumen-row {
      display: flex;
      justify-content: space-between;
      font-size: .83rem;
      padding: 6px 16px;
    }
    .hr-resumen-row span:first-child { color: var(--hr-muted); font-size: .72rem; text-transform: uppercase; letter-spacing: .6px; }
    .hr-resumen-row span:last-child { font-weight: 500; color: var(--hr-text); }

    .hr-nueva-reserva {
      margin-top: 12px;
      background: none;
      border: 1px solid var(--hr-border);
      color: var(--hr-muted);
      border-radius: 0;
      padding: 11px;
      font-size: .78rem;
      font-family: inherit;
      font-weight: 600;
      letter-spacing: .6px;
      text-transform: uppercase;
      cursor: pointer;
      width: 100%;
      transition: border-color .2s, color .2s;
    }
    .hr-nueva-reserva:hover { border-color: var(--hr-primary); color: var(--hr-primary); }

    /* ── Init states ── */
    .hr-init-loading {
      padding: 48px 32px;
      text-align: center;
      color: var(--hr-muted);
      font-size: .88rem;
      background: var(--hr-secondary);
    }
    .hr-init-error {
      padding: 32px 32px;
      text-align: center;
      color: #b91c1c;
      font-size: .86rem;
      background: var(--hr-secondary);
    }

    /* ── Powered by ── */
    .hr-powered {
      text-align: center;
      padding: 16px 0 2px;
      font-size: .62rem;
      color: var(--hr-muted);
      opacity: .5;
      letter-spacing: .8px;
      text-transform: uppercase;
    }

    /* ── Responsive ── */
    @media (max-width: 500px) {
      .hr-widget {
        max-width: 100%;
        box-shadow: none;
        min-height: 100vh;
      }
      .hr-header { padding: 24px 24px 18px; }
      .hr-body { padding: 24px 24px 28px; }
      .hr-slots-grid { grid-template-columns: repeat(3, 1fr); }
    }
  `;

  /* ─── Estado ─────────────────────────────────────────────────────── */
  function freshState() {
    return {
      step: 1,
      fecha: null,
      hora: null,
      plazas_libres: null,
      slots: [],
      loading: false,
      error: null,
      confirmacion: null,
      nombre: '',
      email: '',
      telefono: '',
      personas: 1,
    };
  }
  let state = freshState();
  let container = null;

  /* ─── API ────────────────────────────────────────────────────────── */
  async function fetchConfig() {
    const url = `${API_BASE}/config?service_slug=${encodeURIComponent(SERVICE_SLUG)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo cargar la configuración');
    return data.data;
  }

  async function fetchSlots(fecha) {
    const url = `${API_BASE}/disponibilidad?service_id=${encodeURIComponent(config.service_id)}&fecha=${encodeURIComponent(fecha)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error HTTP ${res.status}`);
    return data;
  }

  async function postReserva(payload) {
    const res = await fetch(`${API_BASE}/reserva`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, service_id: config.service_id }),
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch {
      if (res.ok) return { ok: true };
      throw new Error(`Error HTTP ${res.status}`);
    }
    if (!res.ok || data.ok === false) throw new Error(data.error || `Error ${res.status}`);
    return data;
  }

  /* ─── Helpers ────────────────────────────────────────────────────── */
  function formatFecha(f) {
    if (!f) return '';
    const [y, m, d] = f.split('-');
    return `${d}/${m}/${y}`;
  }
  function formatHora(h) { return h ? h.slice(0, 5) : ''; }
  function minDate() { return new Date().toISOString().split('T')[0]; }
  function serviceMeta() {
    const parts = [];
    if (config.duracion) parts.push(config.duracion + ' min');
    if (config.precio != null) parts.push(config.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) + '/persona');
    return parts.join(' · ');
  }

  /* ─── Render ─────────────────────────────────────────────────────── */
  function applyColors() {
    const primary = config.color_accent || config.color_primary || '#0e4159';
    container.style.setProperty('--hr-primary',   primary);
    container.style.setProperty('--hr-accent',    primary);
    container.style.setProperty('--hr-secondary', config.color_secondary || '#f6f3f1');
  }

  function render() {
    container.innerHTML = buildHTML();
    attachEvents();
  }

  function buildHTML() {
    const stepDots = [1, 2, 3, 4]
      .map(n => `<div class="hr-step-dot ${state.step >= n ? 'active' : ''}"></div>`)
      .join('');

    const meta = serviceMeta();
    const headerText = {
      1: { title: config.nombre || 'Reservas', sub: meta || 'Selecciona una fecha' },
      2: { title: 'Elige tu hora', sub: formatFecha(state.fecha) },
      3: { title: 'Tus datos', sub: `${formatFecha(state.fecha)} · ${formatHora(state.hora)}` },
      4: { title: '¡Reserva confirmada!', sub: `${config.establishment_nombre || config.nombre} — Te esperamos` },
    }[state.step];

    const logoHtml = config.logo_url
      ? `<div class="hr-logo-wrap"><img class="hr-logo hr-logo-img" src="${config.logo_url}" alt=""></div>`
      : `<div class="hr-logo-wrap"><span class="hr-logo-placeholder">${config.nombre || ''}</span></div>`;

    return `
      <div class="hr-header">
        <div class="hr-header-top">
          ${logoHtml}
          <div>
            <h2>${headerText.title}</h2>
            <p>${headerText.sub}</p>
          </div>
        </div>
        ${state.step < 4 && config.establishment_nombre ? `<div class="hr-tipo-badge">${config.establishment_nombre}</div>` : ''}
        <div class="hr-steps">${stepDots}</div>
      </div>
      <div class="hr-body">
        ${state.error ? `<div class="hr-error">${state.error}</div>` : ''}
        ${buildStep()}
        <div class="hr-powered">Powered by SavvyTech Hotels</div>
      </div>
    `;
  }

  function buildStep() {
    switch (state.step) {
      case 1: return buildStep1();
      case 2: return buildStep2();
      case 3: return buildStep3();
      case 4: return buildStep4();
    }
  }

  function buildStep1() {
    return `
      <div class="hr-field">
        <label class="hr-label">Fecha</label>
        <input class="hr-input" type="date" id="hr-fecha" min="${minDate()}" value="${state.fecha || ''}">
      </div>
      <button class="hr-btn" id="hr-btn-step1" ${!state.fecha ? 'disabled' : ''}>
        Ver disponibilidad →
      </button>
    `;
  }

  function buildStep2() {
    if (state.loading) {
      const skeletons = Array(6).fill(`<div class="hr-skeleton hr-skeleton-slot"></div>`).join('');
      return `
        <div class="hr-skeleton-slots">${skeletons}</div>
        <div class="hr-skeleton hr-skeleton-btn"></div>
      `;
    }
    if (!state.slots.length) {
      return `
        <button class="hr-btn-back" id="hr-btn-back2">← Cambiar fecha</button>
        <div class="hr-empty">
          <div style="font-size:1.8rem;margin-bottom:10px">📅</div>
          No hay plazas disponibles para esta fecha.<br>Prueba con otro día.
        </div>
      `;
    }
    const cards = state.slots.map(s => {
      const pocas = s.plazas_libres <= 2;
      return `
        <div class="hr-slot ${state.hora === s.hora ? 'selected' : ''} ${pocas ? 'pocas' : ''}"
             data-hora="${s.hora}" data-plazas="${s.plazas_libres}">
          <div class="hora">${formatHora(s.hora)}</div>
          <div class="plazas">${pocas ? '¡Solo ' + s.plazas_libres + '!' : s.plazas_libres + ' plazas'}</div>
        </div>`;
    }).join('');
    return `
      <button class="hr-btn-back" id="hr-btn-back2">← Cambiar fecha</button>
      <label class="hr-label">Horarios disponibles</label>
      <div class="hr-slots-grid">${cards}</div>
      <button class="hr-btn" id="hr-btn-step2" ${!state.hora ? 'disabled' : ''}>Continuar →</button>
    `;
  }

  function buildStep3() {
    const maxPersonas = state.plazas_libres || 10;
    return `
      <button class="hr-btn-back" id="hr-btn-back3">← Cambiar hora</button>
      <div class="hr-field">
        <label class="hr-label">Nombre completo</label>
        <input class="hr-input" type="text" id="hr-nombre" placeholder="María García" value="${state.nombre || ''}">
      </div>
      <div class="hr-field">
        <label class="hr-label">Email</label>
        <input class="hr-input" type="email" id="hr-email" placeholder="maria@email.com" value="${state.email || ''}">
      </div>
      <div class="hr-field">
        <label class="hr-label">Teléfono</label>
        <input class="hr-input" type="tel" id="hr-telefono" placeholder="+34 600 000 000" value="${state.telefono || ''}">
      </div>
      <div class="hr-field">
        <label class="hr-label">Número de personas</label>
        <select class="hr-input" id="hr-personas">
          ${Array.from({ length: maxPersonas }, (_, i) => i + 1)
            .map(n => `<option value="${n}" ${state.personas == n ? 'selected' : ''}>${n} persona${n > 1 ? 's' : ''}</option>`)
            .join('')}
        </select>
      </div>
      <button class="hr-btn" id="hr-btn-step3" ${state.loading ? 'disabled' : ''}>
        ${state.loading
          ? `<span class="hr-spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></span>Confirmando…`
          : 'Confirmar reserva'}
      </button>
    `;
  }

  function buildStep4() {
    return `
      <div class="hr-success">
        <div class="hr-success-icon">✓</div>
        <h3>¡Todo listo!</h3>
        <p>Hemos enviado la confirmación a<br><strong>${state.email}</strong></p>
        <div class="hr-resumen">
          ${config.establishment_nombre ? `<div class="hr-resumen-row"><span>Establecimiento</span><span>${config.establishment_nombre}</span></div>` : ''}
          <div class="hr-resumen-row"><span>Servicio</span><span>${config.nombre}</span></div>
          <div class="hr-resumen-row"><span>Fecha</span><span>${formatFecha(state.fecha)}</span></div>
          <div class="hr-resumen-row"><span>Hora</span><span>${formatHora(state.hora)}</span></div>
          <div class="hr-resumen-row"><span>Personas</span><span>${state.personas}</span></div>
          <div class="hr-resumen-row"><span>Nombre</span><span>${state.nombre}</span></div>
          ${state.telefono ? `<div class="hr-resumen-row"><span>Teléfono</span><span>${state.telefono}</span></div>` : ''}
        </div>
        <button class="hr-nueva-reserva" id="hr-nueva-reserva">Hacer otra reserva</button>
      </div>
    `;
  }

  /* ─── Eventos ────────────────────────────────────────────────────── */
  function attachEvents() {
    const logoImg = container.querySelector('.hr-logo-img');
    if (logoImg) {
      logoImg.addEventListener('error', () => {
        logoImg.parentElement.innerHTML = `<span class="hr-logo-placeholder">${config.nombre || ''}</span>`;
      });
    }

    const fechaInput = container.querySelector('#hr-fecha');
    if (fechaInput) {
      fechaInput.addEventListener('change', () => {
        state.fecha = fechaInput.value;
        state.error = null;
        const btn = container.querySelector('#hr-btn-step1');
        if (btn) btn.disabled = !state.fecha;
      });
    }

    const btnStep1 = container.querySelector('#hr-btn-step1');
    if (btnStep1) btnStep1.addEventListener('click', goToStep2);

    const btnBack2 = container.querySelector('#hr-btn-back2');
    if (btnBack2) btnBack2.addEventListener('click', () => { state.step = 1; state.error = null; render(); });

    container.querySelectorAll('.hr-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        state.hora = slot.dataset.hora;
        state.plazas_libres = parseInt(slot.dataset.plazas, 10);
        state.error = null;
        container.querySelectorAll('.hr-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        const btn = container.querySelector('#hr-btn-step2');
        if (btn) btn.disabled = false;
      });
    });

    const btnStep2 = container.querySelector('#hr-btn-step2');
    if (btnStep2) btnStep2.addEventListener('click', () => { state.step = 3; state.error = null; render(); });

    const btnBack3 = container.querySelector('#hr-btn-back3');
    if (btnBack3) btnBack3.addEventListener('click', () => { state.step = 2; state.error = null; render(); });

    const btnStep3 = container.querySelector('#hr-btn-step3');
    if (btnStep3) btnStep3.addEventListener('click', submitReserva);

    const btnNueva = container.querySelector('#hr-nueva-reserva');
    if (btnNueva) btnNueva.addEventListener('click', () => { state = freshState(); render(); });
  }

  async function goToStep2() {
    state.step = 2;
    state.loading = true;
    state.hora = null;
    state.error = null;
    render();
    try {
      const res = await fetchSlots(state.fecha);
      state.slots = res.ok ? res.data : [];
      if (!res.ok) state.error = res.error || 'Error al consultar disponibilidad';
    } catch (e) {
      state.slots = [];
      state.error = e.message;
    }
    state.loading = false;
    render();
  }

  async function submitReserva() {
    const nombre    = container.querySelector('#hr-nombre').value.trim();
    const email     = container.querySelector('#hr-email').value.trim();
    const telefono  = container.querySelector('#hr-telefono').value.trim();
    const personas  = parseInt(container.querySelector('#hr-personas').value, 10);

    if (!nombre) { state.error = 'El nombre es obligatorio'; render(); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      state.error = 'Introduce un email válido'; render(); return;
    }
    if (!telefono) { state.error = 'El teléfono es obligatorio'; render(); return; }

    state.nombre    = nombre;
    state.email     = email;
    state.telefono  = telefono;
    state.personas  = personas;
    state.loading   = true;
    state.error     = null;
    render();

    try {
      await postReserva({ nombre, email, telefono, fecha: state.fecha, hora: state.hora, personas });
      state.step = 4;
    } catch (e) {
      state.error = e.message;
    }
    state.loading = false;
    render();
  }

  /* ─── Init ───────────────────────────────────────────────────────── */
  async function init() {
    if (!document.querySelector('#hr-widget-styles')) {
      const style = document.createElement('style');
      style.id = 'hr-widget-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    container = document.querySelector('#hotel-reservas');
    if (!container) {
      container = document.createElement('div');
      container.id = 'hotel-reservas';
      const scriptTag = document.currentScript || document.querySelector('script[src*="widget-reservas"]');
      const selector = scriptTag && scriptTag.dataset.container;
      const target = selector ? document.querySelector(selector) : null;
      (target || document.body).appendChild(container);
    }
    container.classList.add('hr-widget');

    if (!SERVICE_SLUG) {
      container.innerHTML = `<div class="hr-init-error">⚠️ Falta el parámetro <code>?service_slug=</code> en la URL del script.</div>`;
      return;
    }

    // Skeleton de carga inicial
    container.innerHTML = `
      <div class="hr-header" style="background:#0e4159;padding:24px 28px 20px">
        <div class="hr-header-top" style="gap:14px;margin-bottom:6px">
          <div class="hr-logo-wrap"></div>
          <div style="flex:1">
            <div class="hr-skeleton" style="height:16px;width:60%;border-radius:6px;margin-bottom:8px"></div>
            <div class="hr-skeleton" style="height:10px;width:40%;border-radius:4px;opacity:.6"></div>
          </div>
        </div>
        <div style="display:flex;gap:5px;margin-top:14px">
          ${[1,2,3,4].map(() => '<div style="flex:1;height:2px;border-radius:2px;background:rgba(255,255,255,.15)"></div>').join('')}
        </div>
      </div>
      <div class="hr-body">
        <div class="hr-skeleton" style="height:44px;border-radius:12px;margin-bottom:16px"></div>
        <div class="hr-skeleton hr-skeleton-btn"></div>
      </div>
    `;

    try {
      const cfg = await fetchConfig();
      config.service_id          = cfg.service_id || null;
      config.nombre              = cfg.nombre || '';
      config.establishment_nombre = cfg.establishment_nombre || '';
      config.duracion            = cfg.duracion || null;
      config.precio              = cfg.precio != null ? Number(cfg.precio) : null;
      config.color_primary       = cfg.color_accent    || (cfg.config && cfg.config.color_primary)   || '#0e4159';
      config.color_accent        = cfg.color_accent    || (cfg.config && cfg.config.color_accent)     || (cfg.config && cfg.config.color_primary) || '#0e4159';
      config.color_secondary     = cfg.color_secondary || (cfg.config && cfg.config.color_secondary)  || '#f6f3f1';
      config.logo_url            = (cfg.config && cfg.config.logo_url) || '';
      config.foto_url            = cfg.foto_url || '';
    } catch (e) {
      container.innerHTML = `<div class="hr-init-error">No se pudo cargar el widget.<br><small>${e.message}</small></div>`;
      return;
    }

    applyColors();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
