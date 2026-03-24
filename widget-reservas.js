(function () {
  'use strict';

  /* ─── Configuración ──────────────────────────────────────────────── */
  const API_BASE = 'https://vmi3024621.contaboserver.net/webhook';

  const _scriptEl = document.currentScript || document.querySelector('script[src*="widget-reservas"]');
  let ESTABLISHMENT_ID = null;
  try {
    const _u = new URL(_scriptEl ? _scriptEl.src : '');
    ESTABLISHMENT_ID = _u.searchParams.get('id');
  } catch {}

  /* ─── Config del establecimiento ─────────────────────────────────── */
  let config = {
    nombre: '',
    tipo: 'spa',
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
      --hr-secondary: #f6f3f1;
      --hr-surface:   #ffffff;
      --hr-text:      #1a2e3b;
      --hr-muted:     #7a8fa0;
      --hr-border:    #e4ddd6;
      --hr-radius:    12px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      max-width: 460px;
      margin: 0 auto;
      background: var(--hr-surface);
      border-radius: 20px;
      box-shadow: 0 8px 40px rgba(14,65,89,.13);
      overflow: hidden;
    }

    /* ── Header ── */
    .hr-header {
      background: var(--hr-primary);
      padding: 24px 28px 20px;
      color: #fff;
      position: relative;
    }
    .hr-header-top {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 6px;
    }
    .hr-logo-wrap {
      width: 42px; height: 42px;
      border-radius: 10px;
      background: rgba(255,255,255,.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .hr-logo { width: 100%; height: 100%; object-fit: cover; }
    .hr-logo-placeholder {
      font-size: 20px;
      line-height: 1;
    }
    .hr-header h2 {
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -.2px;
    }
    .hr-header p {
      font-size: .8rem;
      opacity: .6;
      margin-top: 2px;
      font-weight: 400;
    }
    .hr-tipo-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(255,255,255,.12);
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 20px;
      padding: 3px 10px;
      font-size: .75rem;
      margin-bottom: 14px;
      color: rgba(255,255,255,.85);
      font-weight: 500;
    }
    .hr-steps {
      display: flex;
      gap: 5px;
    }
    .hr-step-dot {
      flex: 1;
      height: 2px;
      border-radius: 2px;
      background: rgba(255,255,255,.2);
      transition: background .35s;
    }
    .hr-step-dot.active { background: rgba(255,255,255,.9); }

    /* ── Body ── */
    .hr-body { padding: 24px 28px 28px; background: var(--hr-secondary); }

    /* ── Labels / Fields ── */
    .hr-label {
      display: block;
      font-size: .72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .7px;
      color: var(--hr-muted);
      margin-bottom: 7px;
    }
    .hr-field { margin-bottom: 16px; }
    .hr-input {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid var(--hr-border);
      border-radius: var(--hr-radius);
      font-size: .93rem;
      font-family: inherit;
      color: var(--hr-text);
      background: var(--hr-surface);
      transition: border-color .2s, box-shadow .2s;
      outline: none;
      appearance: none;
    }
    .hr-input:focus {
      border-color: var(--hr-primary);
      box-shadow: 0 0 0 3px rgba(14,65,89,.1);
    }

    /* ── Slots ── */
    .hr-slots-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }
    .hr-slot {
      border: 1.5px solid var(--hr-border);
      border-radius: var(--hr-radius);
      padding: 12px 6px;
      text-align: center;
      cursor: pointer;
      transition: border-color .2s, background .2s, transform .15s, box-shadow .2s;
      background: var(--hr-surface);
    }
    .hr-slot:hover {
      border-color: var(--hr-primary);
      background: var(--hr-surface);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(14,65,89,.12);
    }
    .hr-slot.selected {
      border-color: var(--hr-primary);
      background: var(--hr-primary);
    }
    .hr-slot.selected .hora { color: #fff; }
    .hr-slot.selected .plazas { color: rgba(255,255,255,.7); }
    .hr-slot .hora { font-size: .92rem; font-weight: 700; color: var(--hr-text); }
    .hr-slot .plazas { font-size: .7rem; color: var(--hr-muted); margin-top: 3px; }
    .hr-slot.pocas .plazas { color: #d97706; }
    .hr-empty {
      text-align: center;
      padding: 28px 0;
      color: var(--hr-muted);
      font-size: .88rem;
      line-height: 1.6;
    }

    /* ── Botones ── */
    .hr-btn {
      width: 100%;
      padding: 13px;
      background: var(--hr-primary);
      color: #fff;
      border: none;
      border-radius: var(--hr-radius);
      font-size: .95rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      letter-spacing: .1px;
      transition: opacity .2s, transform .15s, box-shadow .2s;
      box-shadow: 0 4px 14px rgba(14,65,89,.25);
    }
    .hr-btn:hover:not(:disabled) {
      opacity: .88;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(14,65,89,.3);
    }
    .hr-btn:active:not(:disabled) { transform: translateY(0); }
    .hr-btn:disabled { opacity: .4; cursor: not-allowed; box-shadow: none; }

    .hr-btn-back {
      background: none;
      border: none;
      color: var(--hr-muted);
      font-size: .83rem;
      font-family: inherit;
      cursor: pointer;
      margin-bottom: 18px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: color .15s;
    }
    .hr-btn-back:hover { color: var(--hr-text); }

    /* ── Error ── */
    .hr-error {
      background: #fff0f0;
      border: 1px solid #fca5a5;
      color: #b91c1c;
      border-radius: var(--hr-radius);
      padding: 10px 14px;
      font-size: .84rem;
      margin-bottom: 16px;
    }

    /* ── Skeleton loaders ── */
    @keyframes hr-shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .hr-skeleton {
      border-radius: var(--hr-radius);
      background: linear-gradient(90deg, #e8f0f5 25%, #d0e2ea 50%, #e8f0f5 75%);
      background-size: 800px 100%;
      animation: hr-shimmer 1.4s infinite linear;
    }
    .hr-skeleton-slots {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }
    .hr-skeleton-slot { height: 62px; border-radius: var(--hr-radius); }
    .hr-skeleton-btn { height: 48px; border-radius: var(--hr-radius); margin-top: 4px; }

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
      width: 24px; height: 24px;
      border: 2.5px solid rgba(14,65,89,.15);
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
      width: 58px; height: 58px;
      background: rgba(14,65,89,.08);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 1.5rem;
      color: var(--hr-primary);
    }
    .hr-success h3 { font-size: 1.1rem; font-weight: 700; color: var(--hr-text); margin-bottom: 6px; }
    .hr-success p { font-size: .85rem; color: var(--hr-muted); line-height: 1.55; }

    .hr-resumen {
      background: var(--hr-surface);
      border: 1px solid var(--hr-border);
      border-radius: var(--hr-radius);
      padding: 14px 16px;
      margin: 18px 0;
      text-align: left;
    }
    .hr-resumen-row {
      display: flex;
      justify-content: space-between;
      font-size: .85rem;
      padding: 5px 0;
      border-bottom: 1px solid var(--hr-border);
    }
    .hr-resumen-row:last-child { border-bottom: none; }
    .hr-resumen-row span:first-child { color: var(--hr-muted); }
    .hr-resumen-row span:last-child { font-weight: 600; color: var(--hr-text); }

    .hr-nueva-reserva {
      margin-top: 14px;
      background: none;
      border: 1.5px solid var(--hr-border);
      color: var(--hr-text);
      border-radius: var(--hr-radius);
      padding: 10px;
      font-size: .86rem;
      font-family: inherit;
      cursor: pointer;
      width: 100%;
      transition: border-color .2s, color .2s;
    }
    .hr-nueva-reserva:hover { border-color: var(--hr-primary); color: var(--hr-primary); }

    /* ── Init states ── */
    .hr-init-loading {
      padding: 48px 28px;
      text-align: center;
      color: var(--hr-muted);
      font-size: .88rem;
      background: var(--hr-secondary);
    }
    .hr-init-error {
      padding: 32px 28px;
      text-align: center;
      color: #b91c1c;
      font-size: .86rem;
      background: var(--hr-secondary);
    }

    /* ── Powered by ── */
    .hr-powered {
      text-align: center;
      padding: 10px 0 4px;
      font-size: .68rem;
      color: var(--hr-muted);
      opacity: .6;
      letter-spacing: .3px;
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
      personas: 1,
    };
  }
  let state = freshState();
  let container = null;

  /* ─── API ────────────────────────────────────────────────────────── */
  async function fetchConfig() {
    const url = `${API_BASE}/config?establishment_id=${encodeURIComponent(ESTABLISHMENT_ID)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo cargar la configuración');
    return data.data;
  }

  async function fetchSlots(fecha) {
    const url = `${API_BASE}/disponibilidad?establishment_id=${encodeURIComponent(ESTABLISHMENT_ID)}&fecha=${encodeURIComponent(fecha)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error HTTP ${res.status}`);
    return data;
  }

  async function postReserva(payload) {
    const res = await fetch(`${API_BASE}/reserva`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, establishment_id: ESTABLISHMENT_ID }),
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
  function tipoLabel() { return config.tipo === 'restaurante' ? '🍽 Restaurante' : '♨ Spa'; }

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

    const headerText = {
      1: { title: config.nombre || 'Reservas', sub: 'Selecciona una fecha' },
      2: { title: 'Elige tu hora', sub: formatFecha(state.fecha) },
      3: { title: 'Tus datos', sub: `${formatFecha(state.fecha)} · ${formatHora(state.hora)}` },
      4: { title: '¡Reserva confirmada!', sub: `${config.nombre} — Te esperamos` },
    }[state.step];

    const logoHtml = config.logo_url
      ? `<div class="hr-logo-wrap"><img class="hr-logo" src="${config.logo_url}" alt="${config.nombre}"></div>`
      : `<div class="hr-logo-wrap"><span class="hr-logo-placeholder">${config.tipo === 'restaurante' ? '🍽' : '♨'}</span></div>`;

    return `
      <div class="hr-header">
        <div class="hr-header-top">
          ${logoHtml}
          <div>
            <h2>${headerText.title}</h2>
            <p>${headerText.sub}</p>
          </div>
        </div>
        ${state.step < 4 ? `<div class="hr-tipo-badge">${tipoLabel()}</div>` : ''}
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
          <div class="hr-resumen-row"><span>Establecimiento</span><span>${config.nombre}</span></div>
          <div class="hr-resumen-row"><span>Fecha</span><span>${formatFecha(state.fecha)}</span></div>
          <div class="hr-resumen-row"><span>Hora</span><span>${formatHora(state.hora)}</span></div>
          <div class="hr-resumen-row"><span>Personas</span><span>${state.personas}</span></div>
          <div class="hr-resumen-row"><span>Nombre</span><span>${state.nombre}</span></div>
        </div>
        <button class="hr-nueva-reserva" id="hr-nueva-reserva">Hacer otra reserva</button>
      </div>
    `;
  }

  /* ─── Eventos ────────────────────────────────────────────────────── */
  function attachEvents() {
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
    const nombre   = container.querySelector('#hr-nombre').value.trim();
    const email    = container.querySelector('#hr-email').value.trim();
    const personas = parseInt(container.querySelector('#hr-personas').value, 10);

    if (!nombre) { state.error = 'El nombre es obligatorio'; render(); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      state.error = 'Introduce un email válido'; render(); return;
    }

    state.nombre   = nombre;
    state.email    = email;
    state.personas = personas;
    state.loading  = true;
    state.error    = null;
    render();

    try {
      await postReserva({ nombre, email, fecha: state.fecha, hora: state.hora, personas });
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

    if (!ESTABLISHMENT_ID) {
      container.innerHTML = `<div class="hr-init-error">⚠️ Falta el parámetro <code>?id=</code> en la URL del script.</div>`;
      return;
    }

    // Skeleton de carga inicial
    container.innerHTML = `
      <div class="hr-header" style="background:#0e4159;padding:24px 28px 20px">
        <div class="hr-header-top" style="gap:14px;margin-bottom:6px">
          <div class="hr-logo-wrap" style="background:rgba(255,255,255,.15)"></div>
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
      config.nombre          = cfg.nombre || '';
      config.tipo            = cfg.tipo || 'spa';
      config.color_primary   = (cfg.config && cfg.config.color_primary)   || '#0e4159';
      config.color_accent    = (cfg.config && cfg.config.color_accent)     || (cfg.config && cfg.config.color_primary) || '#0e4159';
      config.color_secondary = (cfg.config && cfg.config.color_secondary)  || '#f6f3f1';
      config.logo_url        = (cfg.config && cfg.config.logo_url)         || '';
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
