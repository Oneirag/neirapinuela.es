/* global html2canvas */
const GeoApp = (() => {
  const state = {
    config: null,
    currentMapKey: 'europe',
    currentSetKey: 'puntos',
    items: [],          // [{id, num, name, type, solution: {xPct,yPct, tol}}]
    placed: {},         // id -> { xPct, yPct, markerEl }
    mapSvgRaw: '',      // SVG string
    overlay: null,
    markersLayer: null,
    linksLayer: null,
    solutionsLayer: null,
    stageEl: null,
    mapContentEl: null, // Wrapper for zoom/pan
    svgHolder: null,
    itemsListEl: null,
    score: { correct: 0, total: 0 },
    showNames: true,
    transform: { k: 1, x: 0, y: 0 } // Zoom/Pan state
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function init(config) {
    state.config = config;
    state.overlay = $('#overlay');
    state.markersLayer = $('#markers');
    state.linksLayer = $('#links');
    state.solutionsLayer = $('#solutions');
    state.stageEl = $('#map-stage');
    state.mapContentEl = $('#map-content');
    state.svgHolder = $('#svg-holder');
    state.itemsListEl = $('#items-list');

    // UI listeners
    $('#map-select').addEventListener('change', (e) => {
      state.currentMapKey = e.target.value;
      loadMapAndData();
    });
    $('#set-select').addEventListener('change', (e) => {
      state.currentSetKey = e.target.value;
      loadMapAndData();
    });
    $('#toggle-names').addEventListener('change', (e) => {
      state.showNames = !e.target.checked;
      renderItems();
    });
    $('#btn-reset').addEventListener('click', resetAll);
    $('#btn-clear-placed').addEventListener('click', clearPlaced);
    $('#btn-check').addEventListener('click', checkAnswers);
    $('#btn-show-sol').addEventListener('click', toggleSolutions);
    $('#btn-download').addEventListener('click', downloadPNG);

    // Zoom controls
    setupZoomPan();

    // Stage: drag-drop y modo autor (Shift+click para capturar coords)
    setupDragAndDrop();
    setupAuthoringAid();

    loadMapAndData();
  }

  async function loadMapAndData() {
    clearVisuals();

    const mapUrl = state.config.maps[state.currentMapKey];
    const dataUrl = state.config.dataByMapAndSet[state.currentMapKey]?.[state.currentSetKey];

    // Determine if it's an image or an SVG based on extension
    const isImage = /\.(jpg|jpeg|png)$/i.test(mapUrl);

    if (isImage) {
      // Load image to get dimensions
      const dim = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 1000, h: 625 }); // Fallback
        img.src = mapUrl;
      });

      // Construct SVG wrapper
      const svg = `
        <svg viewBox="0 0 ${dim.w} ${dim.h}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <image href="${mapUrl}" width="${dim.w}" height="${dim.h}" />
        </svg>
      `;
      state.mapSvgRaw = svg;
      state.svgHolder.innerHTML = svg;

      // Set aspect ratio
      const aspectRatio = dim.w / dim.h;
      state.stageEl.style.aspectRatio = aspectRatio.toString();

    } else {
      // Existing SVG text logic
      // Cargar mapa (SVG)
      try {
        const svgText = await fetch(mapUrl).then(r => r.text());
        state.mapSvgRaw = svgText;
        state.svgHolder.innerHTML = svgText;

        // Ajustar aspect ratio del contenedor según el viewBox del SVG
        const svgEl = state.svgHolder.querySelector('svg');
        if (svgEl) {
          const viewBox = svgEl.getAttribute('viewBox');
          if (viewBox) {
            const [vbX, vbY, vbW, vbH] = viewBox.split(/\s+/).map(Number);
            // Calcular y aplicar aspect ratio real del mapa
            const aspectRatio = vbW / vbH;
            state.stageEl.style.aspectRatio = aspectRatio.toString();
          }
        }
      } catch (e) {
        console.error("Error loading SVG map:", e);
      }
    }

    syncOverlayViewBox();    // Cargar datos
    try {
      const data = await fetch(dataUrl).then(r => r.json());
      state.items = data.items || [];
    } catch (e) {
      console.warn('No se pudo cargar el dataset. Usando vacío.', e);
      state.items = [];
    }
    state.score.total = state.items.length;
    $('#score-total').textContent = state.score.total.toString();
    $('#score-correct').textContent = '0';

    // Reset zoom on map change
    state.transform = { k: 1, x: 0, y: 0 };
    updateTransform();

    renderItems();
  }

  function syncOverlayViewBox() {
    // Si el <svg> del mapa tiene viewBox, úsalo para el overlay
    const mapSvg = state.svgHolder.querySelector('svg');
    if (mapSvg && mapSvg.getAttribute('viewBox')) {
      state.overlay.setAttribute('viewBox', mapSvg.getAttribute('viewBox'));
      state.overlay.setAttribute('preserveAspectRatio', mapSvg.getAttribute('preserveAspectRatio') || 'xMidYMid meet');
    } else {
      // Fallback: usar viewBox estándar 1000x625
      state.overlay.setAttribute('viewBox', '0 0 1000 625');
      state.overlay.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  }


  function clearVisuals() {
    state.markersLayer.innerHTML = '';
    state.linksLayer.innerHTML = '';
    state.solutionsLayer.innerHTML = '';
    state.placed = {};
    state.score.correct = 0;
    $('#score-correct').textContent = '0';
    // Quitar clases "placed" en labels si existían
    $$('#items-list .draggable-label').forEach(el => el.classList.remove('placed'));
  }

  function renderItems() {
    state.itemsListEl.innerHTML = '';
    state.items.forEach((it, idx) => {
      const num = it.num ?? (idx + 1);
      it.num = num;
      // Etiqueta arrastrable
      const label = document.createElement('div');
      label.className = 'draggable-label';
      label.setAttribute('draggable', 'true');
      label.dataset.id = it.id;
      label.dataset.num = num;
      label.textContent = num;

      // Contenedor flex para número + nombre
      const wrap = document.createElement('div');
      wrap.className = 'd-flex align-items-center me-2 mb-2';

      wrap.appendChild(label);

      const name = document.createElement('span');
      name.className = 'item-name';

      // Handle localized names
      let displayName = it.name;
      if (typeof it.name === 'object' && it.name !== null) {
        const lang = window.currentLanguage || 'es';
        displayName = it.name[lang] || it.name['es'] || '';
      }

      name.textContent = displayName;
      name.style.display = state.showNames ? '' : 'none';

      wrap.appendChild(name);
      state.itemsListEl.appendChild(wrap);

      // dragstart - Personalizar imagen de arrastre
      label.addEventListener('dragstart', (ev) => {
        ev.dataTransfer.setData('text/plain', JSON.stringify({ id: it.id, num }));

        // Crear una imagen de arrastre personalizada (círculo semi-transparente)
        const dragImg = document.createElement('div');
        dragImg.style.position = 'absolute';
        dragImg.style.top = '-1000px'; // Fuera de la vista
        dragImg.style.width = '44px';
        dragImg.style.height = '44px';
        dragImg.style.borderRadius = '50%';
        dragImg.style.background = 'rgba(13, 110, 253, 0.5)'; // Azul semi-transparente
        dragImg.style.color = '#fff';
        dragImg.style.display = 'flex';
        dragImg.style.alignItems = 'center';
        dragImg.style.justifyContent = 'center';
        dragImg.style.fontWeight = '700';
        dragImg.style.fontSize = '14px';
        dragImg.textContent = num;

        document.body.appendChild(dragImg);

        // Usar como imagen de arrastre
        ev.dataTransfer.setDragImage(dragImg, 22, 22); // Centrado en el cursor

        // Limpiar después del arrastre
        setTimeout(() => dragImg.remove(), 0);
      });
    });
  }

  function setupDragAndDrop() {
    // Permitir soltar en stage
    state.stageEl.addEventListener('dragover', (ev) => {
      ev.preventDefault();
    });
    state.stageEl.addEventListener('drop', (ev) => {
      ev.preventDefault();
      const dt = ev.dataTransfer.getData('text/plain');
      if (!dt) return;
      const { id, num } = JSON.parse(dt);

      // CAMBIO: Usar coordenadas SVG directamente
      const pt = clientToSvg(ev.clientX, ev.clientY);
      const vb = state.overlay.viewBox.baseVal;
      const xPct = ((pt.x - vb.x) / vb.width) * 100;
      const yPct = ((pt.y - vb.y) / vb.height) * 100;

      placeMarker({ id, num, xPct, yPct });
    });
  }

  function placeMarker({ id, num, xPct, yPct }) {
    // Si ya existe, reemplazar
    if (state.placed[id]?.markerEl) {
      state.placed[id].markerEl.remove();
    }

    const vb = state.overlay.viewBox.baseVal;
    // CAMBIO: Convertir porcentaje considerando el offset del viewBox
    const x = vb.x + (xPct / 100) * vb.width;
    const y = vb.y + (yPct / 100) * vb.height;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('marker');
    g.dataset.id = id;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 22);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 1);
    text.textContent = num;

    g.appendChild(circle);
    g.appendChild(text);

    // Permitir mover el marcador con arrastrar simple
    let dragging = false;
    let offset = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      dragging = true;
      const pt = clientToSvg(e.clientX, e.clientY);
      offset.x = pt.x - parseFloat(circle.getAttribute('cx'));
      offset.y = pt.y - parseFloat(circle.getAttribute('cy'));
      g.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const pt = clientToSvg(e.clientX, e.clientY);
      const nx = pt.x - offset.x;
      const ny = pt.y - offset.y;
      circle.setAttribute('cx', nx);
      circle.setAttribute('cy', ny);
      text.setAttribute('x', nx);
      text.setAttribute('y', ny + 1);
    };
    const onPointerUp = (e) => {
      if (!dragging) return;
      dragging = false;
      // CAMBIO: Actualizar % considerando el offset del viewBox
      const vb = state.overlay.viewBox.baseVal;
      const nx = parseFloat(circle.getAttribute('cx'));
      const ny = parseFloat(circle.getAttribute('cy'));
      const newXPct = ((nx - vb.x) / vb.width) * 100;
      const newYPct = ((ny - vb.y) / vb.height) * 100;
      state.placed[id] = { xPct: newXPct, yPct: newYPct, markerEl: g };
      // Limpiar estilo previo
      g.classList.remove('correct', 'wrong');
    };

    g.addEventListener('pointerdown', onPointerDown);
    g.addEventListener('pointermove', onPointerMove);
    g.addEventListener('pointerup', onPointerUp);

    state.markersLayer.appendChild(g);
    state.placed[id] = { xPct, yPct, markerEl: g };

    // Marcar etiqueta como colocada
    const lab = state.itemsListEl.querySelector(`.draggable-label[data-id="${id}"]`);
    if (lab) lab.classList.add('placed');
  }

  function clientToSvg(clientX, clientY) {
    // 1. Get mouse position relative to the stage viewport
    const rect = state.stageEl.getBoundingClientRect();
    const rx = clientX - rect.left;
    const ry = clientY - rect.top;

    // 2. Remove Pan & Zoom (Inverse CSS transform)
    // visual_x = (content_x * k) + transform_x
    // content_x = (visual_x - transform_x) / k
    const { x: tx, y: ty, k } = state.transform;
    const cx = (rx - tx) / k;
    const cy = (ry - ty) / k;

    // 3. Map content-pixels to SVG ViewBox coordinates
    // We must emulate 'preserveAspectRatio="xMidYMid meet"' calculation
    const vb = state.overlay.viewBox.baseVal;

    // The viewport for the SVG is the full size of the content wrapper (unzoomed stage size)
    const vpW = rect.width;
    const vpH = rect.height;

    // Calculate scales
    const scaleX = vpW / vb.width;
    const scaleY = vpH / vb.height;

    // 'meet' uses the smaller scale to fit the image
    const scale = Math.min(scaleX, scaleY);

    // Calculate the dimensions of the drawn SVG within the viewport
    const drawW = vb.width * scale;
    const drawH = vb.height * scale;

    // Calculate offsets (centering)
    const offX = (vpW - drawW) / 2;
    const offY = (vpH - drawH) / 2;

    // 4. Final mapping: (content_coord - offset) / scale + viewBox_origin
    const svgX = vb.x + (cx - offX) / scale;
    const svgY = vb.y + (cy - offY) / scale;

    return { x: svgX, y: svgY };
  }

  function clearPlaced() {
    Object.values(state.placed).forEach(p => p.markerEl?.remove());
    state.placed = {};
    state.linksLayer.innerHTML = '';
    $$('#items-list .draggable-label').forEach(el => el.classList.remove('placed'));
    $$('#markers .marker').forEach(el => el.classList.remove('correct', 'wrong'));
    state.score.correct = 0;
    $('#score-correct').textContent = '0';
  }

  function resetAll() {
    clearPlaced();
    state.solutionsLayer.innerHTML = '';
    // Reset zoom
    state.transform = { k: 1, x: 0, y: 0 };
    updateTransform();
  }

  function distancePct(a, b) {
    const dx = a.xPct - b.xPct;
    const dy = a.yPct - b.yPct;
    return Math.sqrt(dx * dx + dy * dy);
  }


  // Nueva función: verificar si un punto está cerca de cualquier solución
  function isNearAnySolution(placed, solutions, tol) {
    // Si solutions es un objeto (punto único), convertir a array
    const solutionArray = Array.isArray(solutions) ? solutions : [solutions];

    // Verificar si está cerca de alguno de los puntos de solución
    return solutionArray.some(sol => distancePct(placed, sol) <= tol);
  }

  function checkAnswers() {
    let correct = 0;
    state.linksLayer.innerHTML = '';

    state.items.forEach(it => {
      const placed = state.placed[it.id];
      const g = placed?.markerEl;
      if (!placed || !g) return;

      const tol = it.solution?.tol ?? it.tol ?? 3.0;

      // Soportar tanto solución única como múltiple
      const solutions = Array.isArray(it.solution) ? it.solution : [it.solution];
      const isCorrect = isNearAnySolution(placed, solutions, tol);

      g.classList.toggle('correct', isCorrect);
      g.classList.toggle('wrong', !isCorrect);
      if (isCorrect) correct++;

      // Dibujar líneas hacia TODAS las soluciones
      const vb = state.overlay.viewBox.baseVal;
      const x1 = vb.x + (placed.xPct / 100) * vb.width;
      const y1 = vb.y + (placed.yPct / 100) * vb.height;

      solutions.forEach(sol => {
        const x2 = vb.x + (sol.xPct / 100) * vb.width;
        const y2 = vb.y + (sol.yPct / 100) * vb.height;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.setAttribute('class', 'link-line');
        state.linksLayer.appendChild(line);
      });
    });

    state.score.correct = correct;
    $('#score-correct').textContent = String(correct);
  }

  function toggleSolutions() {
    solutionsVisible = !solutionsVisible;
    state.solutionsLayer.innerHTML = '';
    if (!solutionsVisible) return;

    const vb = state.overlay.viewBox.baseVal;
    state.items.forEach(it => {
      if (!it.solution) return;

      // Soportar tanto solución única como múltiple
      const solutions = Array.isArray(it.solution) ? it.solution : [it.solution];

      solutions.forEach((sol, idx) => {
        const x = vb.x + (sol.xPct / 100) * vb.width;
        const y = vb.y + (sol.yPct / 100) * vb.height;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'marker solution');

        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', x);
        c.setAttribute('cy', y);
        c.setAttribute('r', 14);

        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', x);
        t.setAttribute('y', y + 1);
        // Si hay múltiples puntos, mostrar número con sufijo
        // t.textContent = solutions.length > 1 ? `${it.num}.${idx + 1}` : (it.num ?? '?');
        t.textContent = (it.num ?? '?');

        g.appendChild(c);
        g.appendChild(t);
        state.solutionsLayer.appendChild(g);
      });
    });
  }

  let solutionsVisible = false;

  async function downloadPNG() {
    const node = state.stageEl;
    const canvas = await html2canvas(node, { backgroundColor: '#ffffff', scale: 2 });
    const link = document.createElement('a');
    link.download = `geografia_${state.currentMapKey}_${state.currentSetKey}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function setupZoomPan() {
    // Zoom Buttons
    $('#btn-zoom-in').addEventListener('click', () => zoomBy(1.2));
    $('#btn-zoom-out').addEventListener('click', () => zoomBy(1 / 1.2));
    $('#btn-zoom-reset').addEventListener('click', () => {
      state.transform = { k: 1, x: 0, y: 0 };
      updateTransform();
    });

    // Mouse Wheel Zoom
    state.stageEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = state.stageEl.getBoundingClientRect();
      const dx = e.clientX - rect.left;
      const dy = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newK = Math.max(0.5, Math.min(5, state.transform.k * factor));

      // Zoom towards mouse pointer
      // x' = x - (dx/k - dx/newK) * newK? No, standar formula:
      // Translate to origin (dx, dy), scale, translate back
      // Easier: x_new = x_old + (dx - x_old) * (1 - factor)

      const k = state.transform.k;
      state.transform.x -= (dx - state.transform.x) * (newK / k - 1);
      state.transform.y -= (dy - state.transform.y) * (newK / k - 1);
      state.transform.k = newK;

      updateTransform();
    }, { passive: false });

    // Pan (Drag)
    let isPanning = false;
    let start = { x: 0, y: 0 };
    let startTrans = { x: 0, y: 0 };

    state.stageEl.addEventListener('mousedown', (e) => {
      // Avoid panning when dragging a marker or label
      if (e.target.closest('.draggable-label') || e.target.closest('.marker')) return;

      isPanning = true;
      state.stageEl.style.cursor = 'grabbing';
      start = { x: e.clientX, y: e.clientY };
      startTrans = { ...state.transform };
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      e.preventDefault();
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      state.transform.x = startTrans.x + dx;
      state.transform.y = startTrans.y + dy;
      updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        state.stageEl.style.cursor = '';
      }
    });
  }

  function zoomBy(factor) {
    const rect = state.stageEl.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const newK = Math.max(0.5, Math.min(5, state.transform.k * factor));
    const k = state.transform.k;

    state.transform.x -= (cx - state.transform.x) * (newK / k - 1);
    state.transform.y -= (cy - state.transform.y) * (newK / k - 1);
    state.transform.k = newK;
    updateTransform();
  }

  function updateTransform() {
    const { x, y, k } = state.transform;
    state.mapContentEl.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
  }

  function setupAuthoringAid() {
    let multiPointMode = [];

    state.stageEl.addEventListener('click', (e) => {
      if (!e.shiftKey) return;

      const pt = clientToSvg(e.clientX, e.clientY);
      const vb = state.overlay.viewBox.baseVal;
      const xPct = ((pt.x - vb.x) / vb.width) * 100;
      const yPct = ((pt.y - vb.y) / vb.height) * 100;

      const coord = { xPct: +xPct.toFixed(2), yPct: +yPct.toFixed(2) };

      // Detectar Ctrl (Windows/Linux) o Command (Mac)
      const isMultiPoint = e.ctrlKey || e.metaKey;

      if (isMultiPoint) {
        // Acumular puntos
        multiPointMode.push(coord);
        const text = `"solution": ${JSON.stringify(multiPointMode)}, "tol": 3.0`;
        navigator.clipboard?.writeText(text).catch(() => { });

        // Feedback visual
        const toast = document.createElement('div');
        toast.textContent = `${window.translations.pointAdded} ${multiPointMode.length}. ${window.translations.total}: ${multiPointMode.length}`;
        toast.style.position = 'absolute';
        const rect = state.stageEl.getBoundingClientRect();
        toast.style.left = `${e.clientX - rect.left}px`;
        toast.style.top = `${e.clientY - rect.top - 20}px`;
        toast.style.background = 'rgba(40,167,69,.9)';
        toast.style.color = '#fff';
        toast.style.padding = '4px 8px';
        toast.style.borderRadius = '4px';
        toast.style.fontSize = '12px';
        toast.style.pointerEvents = 'none';
        state.stageEl.appendChild(toast);
        setTimeout(() => toast.remove(), 1200);
      } else {
        // Shift solo: resetear y capturar punto único
        multiPointMode = [];
        const text = `"solution": ${JSON.stringify(coord)}, "tol": 3.0`;
        navigator.clipboard?.writeText(text).catch(() => { });

        // Feedback visual
        const toast = document.createElement('div');
        toast.textContent = `${window.translations.copied}: ${text}`;
        toast.style.position = 'absolute';
        const rect = state.stageEl.getBoundingClientRect();
        toast.style.left = `${e.clientX - rect.left}px`;
        toast.style.top = `${e.clientY - rect.top - 20}px`;
        toast.style.background = 'rgba(0,0,0,.7)';
        toast.style.color = '#fff';
        toast.style.padding = '4px 8px';
        toast.style.borderRadius = '4px';
        toast.style.fontSize = '12px';
        toast.style.pointerEvents = 'none';
        state.stageEl.appendChild(toast);
        setTimeout(() => toast.remove(), 1200);
      }
    });
  }
  return { init };
})();
