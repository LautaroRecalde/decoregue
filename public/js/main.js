/* ============================================
   DECOREGUE - Main JavaScript
   ============================================ */

'use strict';

/* ============================================
   NAVBAR
   ============================================ */
const initNavbar = () => {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');
  const navLinks = document.querySelectorAll('.nav-link');

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileOverlay.classList.toggle('open');
    document.body.style.overflow = mobileOverlay.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
};

/* ============================================
   SCROLL REVEAL
   ============================================ */
const initScrollReveal = () => {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => observer.observe(el));
};

/* ============================================
   BACK TO TOP
   ============================================ */
const initBackToTop = () => {
  const btn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

/* ============================================
   COUNTER ANIMATION
   ============================================ */
const animateCounter = (el, target, suffix = '') => {
  const duration = 2000;
  const start = performance.now();

  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  };

  requestAnimationFrame(update);
};

const initCounters = () => {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-counter'));
        const suffix = el.getAttribute('data-suffix') || '';
        animateCounter(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
};

/* ============================================
   CATALOG FILTER
   ============================================ */
const initCatalogFilter = () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.product-card[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 400);
        }
      });
    });
  });
};

/* ============================================
   CARRUSEL (reutilizable: cards + modal)
   Recibe un elemento .card-carousel y le agrega
   flechas, puntos, swipe y autoplay.
   Devuelve { destroy } para limpiar el intervalo.
   ============================================ */
const setupCarousel = (carousel, { autoplay = true, interval = 4000 } = {}) => {
  const track = carousel.querySelector('.card-carousel-track');
  const slides = carousel.querySelectorAll('.card-carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const prevBtn = carousel.querySelector('.carousel-nav.prev');
  const nextBtn = carousel.querySelector('.carousel-nav.next');
  const counter = carousel.querySelector('.carousel-counter');

  if (!track || slides.length <= 1) return null;

  let current = 0;
  let timer = null;
  const total = slides.length;

  const goTo = (index) => {
    current = ((index % total) + total) % total; // wrap around
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });

    if (counter) {
      counter.textContent = `${current + 1} / ${total}`;
    }
  };

  const stopAuto = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const startAuto = () => {
    if (!autoplay) return;
    stopAuto();
    timer = setInterval(() => goTo(current + 1), interval);
  };

  // Empieza siempre en la primera imagen
  goTo(0);

  // Evita que el click en flechas/puntos abra el modal o cierre algo
  const stopProp = (e) => e.stopPropagation();

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      stopProp(e);
      goTo(current - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      stopProp(e);
      goTo(current + 1);
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      stopProp(e);
      goTo(i);
    });
  });

  // Swipe táctil
  let touchStartX = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAuto();
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
    startAuto();
  }, { passive: true });

  // Autoplay (se pausa con el mouse encima)
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  startAuto();

  return { destroy: stopAuto };
};

const initCardCarousels = () => {
  document.querySelectorAll('.card-carousel').forEach(carousel => {
    setupCarousel(carousel);
  });
};

/* ============================================
   PRODUCT MODAL DATA
   ============================================ */
const productData = {
  'galpon-chapa-corrediza': {
    tag: 'Galpón de Jardín',
    title: 'Galpón de Chapa Corrediza',
    imgModal: '/images/galponchapacorrediza.jpg',
    icon: 'fa-warehouse',
    measures: null, // las medidas se eligen al cotizar
    desc: 'Galpón con paneles estructurales de chapa y puertas corredizas. Ideal para aprovechar tus espacios y darle estilo a tu deposito. Estructura de caño con pintura E-poxi, ideal para resistir la intemperie. Puedes personalizarlo agregandole ventanas, modificando sus medidas y materiales.',
    materials: 'Estructura de caño con pintura E-poxi ideal para exteriores. Paneles estructurales de chapa. Puertas corredizas. Tornillería reforzada.',
    uses: ['Depósito', 'Espacio de trabajo', 'Garage'],
    colors: 'Negro, Gris, Cromado, A elección'
  },
  'galpon-chapa': {
    tag: 'Galpón de Jardín',
    title: 'Galpon de Jardin de Chapa',
    imgModal: 'assets/galpon-chapa-modal.jpg',
    icon: 'fa-warehouse',
    measures: null, // las medidas se eligen al cotizar
    desc: 'Fabricación mediante paneles estructurales, unificados mediante tornillo y tuerca. Techo de chapa atornillado a la estructura mediante tornillos perforantes. Puerta con cerrojo con posibilidad para colocar candado.',
    materials: 'Estructura de hierro con pintura E-poxi (ideal para la intemperie). Chapa estructural adherida a cada panel. Tornillería reforzada.',
    uses: ['Depósito', 'Espacio de trabajo'],
    colors: 'Negro, Gris, Cromado'
  },
  'galpon-madera': {
    tag: 'Galpón de Jardín',
    title: 'Galpon de Jardin de Madera',
    imgModal: 'assets/galpon-madera-modal.jpg',
    icon: 'fa-tree',
    measures: null, // las medidas se eligen al cotizar
    desc: 'Fabricación mediante paneles estructurales, unificados mediante tornillo y tuerca. Techo de chapa atornillado a la estructura mediante tornillos perforantes. Puerta con cerrojo con posibilidad para colocar candado.',
    materials: 'Estructura de hierro con pintura E-poxi. Madera estructural machimbre Taeda con dos manos de aceite de lino, que la protege de la intemperie.',
    uses: ['Depósito', 'Espacio de trabajo']
  },
  'galpon-interior-madera': {
    tag: 'Galpón de Jardín',
    title: 'Galpón con Interior de Madera',
    imgModal: '/images/galponinteriormadera.jpg',
    icon: 'fa-warehouse',
    measures: 'Medidas a convenir',
    desc: 'Diseño de chapa con madera integrada para darle una estética interna. La madera está laqueada y pintada.',
    materials: 'Diseño de chapa con madera integrada en el interior. Madera laqueada y pintada. Estructura de hierro con pintura E-poxi ideal para exteriores.',
    uses: ['Depósito', 'Espacio de trabajo', 'Jardín']
  },
  'quincho-estructural': {
    tag: 'Quincho',
    title: 'Quincho Estructural',
    imgModal: '/images/quinchoestructural.png',
    icon: 'fa-home',
    measures: '4,40 x 2,20 x 200 / A medida',
    desc: 'Quincho estructural con paneles estructurales. Interior en simil madera PVC y exterior en chapa negra/gris o color a elección. La chapa protege el interior de la intemperie dándole un estilo industrial. Modelo personalizable en medidas y materiales.',
    materials: 'Estructura de caño con pintura E-poxi ideal para exteriores. Paneles con cara interna en PVC simil madera y exterior en chapa negra. Piso de chapón reforzado, con posibilidad de integrar rampa.',
    uses: ['Quincho', 'Jardín', 'Espacio social', 'Depósito'],
    colors: 'Chapa negra, Chapa gris, Color a elección'
  },
  'galpon-abierto': {
    tag: 'Galpón Abierto',
    title: 'Galpón Abierto',
    imgModal: 'assets/galpon-quincho-modal.jpg',
    icon: 'fa-house',
    measures: '330 x 220 x 185 / 220 x 220 x 185 / 220 x 110 x 185',
    desc: 'Galpón abierto con paneles estructurales. Interior en simil madera PVC y exterior en chapa negra que protege de la intemperie y evita el contacto directo con el material interno.',
    materials: 'Estructura de caño con pintura E-poxi ideal para exteriores. Paneles con cara interna en PVC simil madera y exterior en chapa negra. Piso de chapón reforzado con capacidad superior a 1000kg.',
    uses: ['Quincho', 'Jardín', 'Espacio social', 'Depósito'],
    colors: 'Marrón Terracota, Roble Claro, Blanco Nieve, Negro Medianoche (u otros a elección)'
  },
  'galpon-personalizado': {
    tag: 'Galpón Personalizado',
    title: 'Galpon de Jardin Personalizado',
    imgModal: 'assets/galpon-personalizado-modal.jpg',
    icon: 'fa-pencil-ruler',
    measures: 'A medida — a convenir',
    desc: 'Diseño completamente personalizable en medidas, materiales y acabados. Fabricamos tu galpón exactamente como lo imaginás, combinando chapa, madera, hierro y los colores que prefieras.',
    materials: 'Materiales a elección: hierro, chapa, madera, pintura E-poxi. Combinaciones personalizadas según tu proyecto.',
    uses: ['Depósito', 'Espacio de trabajo', 'Diseño personalizado']
  },
  'pergola': {
    tag: 'Pérgola de Jardín',
    title: 'Pergola de Jardin',
    imgModal: 'assets/pergola-modal.jpg',
    icon: 'fa-archway',
    measures: 'A convenir según el espacio',
    desc: 'Ideal para equipar un espacio en tu jardín. Trae sombra, baja de temperatura y posibilidad de equiparla como más te guste. Diseño personalizado que se adapta a tu espacio exterior.',
    materials: 'Madera, hierro y chapa. Materiales a convenir para un diseño completamente personalizado.',
    uses: ['Jardín', 'Sombra', 'Decoración exterior']
  },
  'barra-movil': {
    tag: 'Mueble de Jardín',
    title: 'Barra Movil',
    imgModal: 'assets/barra-movil-modal.jpg',
    icon: 'fa-cocktail',
    measures: '1,20 x 0,60 x 1,05 m de altura',
    desc: 'Fabricada a mano en madera y hierro, pensada para disfrutar y decorar tu espacio. Tu barra móvil ideal para asados y encuentros. Funcional, estética y resistente a la intemperie.',
    materials: 'Estructura de hierro con pintura E-poxi. Madera EUCA lijada con laca para una superficie suave y fácil de limpiar.',
    uses: ['Asados', 'Encuentros sociales', 'Decoración']
  },
  'mesa-banquetas': {
    tag: 'Set de Jardín',
    title: 'Mesa Alta + Banquetas',
    imgModal: 'assets/mesa-banquetas-modal.jpg',
    icon: 'fa-chair',
    measures: 'Mesa: 120 x 60 x 105 cm | Banquetas: 35 x 35 x 70 cm',
    desc: 'Kit que incluye la Mesa Alta más dos sillas estilo banqueta. Diseño artístico en los laterales de la mesa, dándole estilo único. Las sillas son del mismo material y cuentan con una leve inclinación para mayor comodidad.',
    materials: 'Estructura de hierro con pintura E-poxi. Madera EUCA lijada con laca para una superficie suave y fácil de limpiar.',
    uses: ['Jardín', 'Patio', 'Entretenimiento']
  }
};

/* ============================================
   COTIZADOR — configuración
   Los productos que tienen entrada acá muestran el
   formulario completo (material, medidas, puerta, ventanas).
   El resto (pérgola, barra, mesa) se cotiza con comentarios.
   Los valores son los que aparecen preseleccionados.
   ============================================ */
const quoteConfig = {
  'galpon-chapa-corrediza': { material: 'Chapa',  puerta: 'Corrediza' },
  'galpon-chapa':           { material: 'Chapa',  puerta: 'Simple' },
  'galpon-madera':          { material: 'Madera', puerta: 'Simple' },
  'galpon-interior-madera': { material: 'Chapa',  interior: true, puerta: 'Simple' },
  'quincho-estructural':    { material: 'Chapa' },
  'galpon-abierto':         { material: 'Chapa' },
  'galpon-personalizado':   { }
};

Object.entries(quoteConfig).forEach(([id, cfg]) => {
  if (productData[id]) productData[id].quote = cfg;
});

const QUOTE_STORAGE_KEY = 'decoregue_cotizacion_v1';

const QUOTE_OPTIONS = {
  materiales:    ['Madera', 'Chapa'],
  anchoLargoChapa:  ['1,10', '2,20', '3,30', '4,40', '5,50', '6,60', '7,70', '8,80', '9,90'],
  anchoLargoMadera: ['1,30', '2,60', '3,90', '5,20', '6,50', '7,80', '9,10'],
  alturas:       ['1,85', '2,00', '2,20', '2,50', '3,00'],
  puertas:       ['Simple', 'Doble', 'Corrediza']
};

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/* ============================================
   COTIZADOR — carrito "Cotizar" + formulario
   ============================================ */
const initQuote = () => {
  const fab = document.getElementById('quoteFab');
  const countEl = document.getElementById('quoteCount');
  const overlay = document.getElementById('quoteOverlay');
  const drawer = document.getElementById('quoteDrawer');
  const itemsEl = document.getElementById('quoteItems');
  const closeBtn = document.getElementById('quoteClose');
  const sendBtn = document.getElementById('quoteSend');
  const clearBtn = document.getElementById('quoteClear');
  const nameInput = document.getElementById('quoteName');
  const zoneInput = document.getElementById('quoteZone');
  const errorEl = document.getElementById('quoteError');

  if (!fab || !drawer || !itemsEl) return null;

  /* ── Estado (se guarda en el navegador para que no se pierda al recargar) ── */
  let items = [];
  try {
    const saved = JSON.parse(localStorage.getItem(QUOTE_STORAGE_KEY) || '[]');
    if (Array.isArray(saved)) items = saved.filter(it => it && it.uid && it.title);
  } catch (e) {
    items = [];
  }

  const persist = () => {
    try { localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(items)); } catch (e) { /* sin storage */ }
  };

  /* Líneas descriptivas de un ítem (sirven para el panel y para WhatsApp) */
  const itemLines = (it) => {
    const lines = [];
    if (it.material) lines.push(['Material', it.material]);
    if (it.interior) lines.push(['Interior de madera', 'Sí']);
    if (it.medidas) lines.push(['Medidas', it.medidas]);
    if (it.puerta) lines.push(['Puerta', it.puerta]);
    if (Number(it.ventanas) > 0) lines.push(['Ventanas', String(it.ventanas)]);
    if (it.notas) lines.push(['Comentarios', it.notas]);
    return lines;
  };

  const render = () => {
    countEl.textContent = items.length;
    fab.classList.toggle('visible', items.length > 0);
    sendBtn.disabled = items.length === 0;
    clearBtn.style.display = items.length ? '' : 'none';

    if (!items.length) {
      itemsEl.innerHTML = `
        <div class="quote-empty">
          <i class="fas fa-clipboard-list" aria-hidden="true"></i>
          <p>Todavía no agregaste productos.</p>
          <span>Elegí un producto del catálogo y tocá <strong>Cotizar</strong>.</span>
        </div>`;
      return;
    }

    itemsEl.innerHTML = items.map(it => `
      <div class="quote-item">
        <div class="quote-item-head">
          <h4 class="quote-item-title">${escapeHTML(it.title)}</h4>
          <button type="button" class="quote-item-remove" data-remove="${escapeHTML(it.uid)}"
                  aria-label="Quitar ${escapeHTML(it.title)} de la cotización">
            <i class="fas fa-trash-alt" aria-hidden="true"></i>
          </button>
        </div>
        <ul class="quote-item-lines">
          ${itemLines(it).map(([k, v]) => `<li><span>${escapeHTML(k)}</span>${escapeHTML(v)}</li>`).join('')}
        </ul>
      </div>`).join('');
  };

  /* ── Panel lateral ── */
  const openDrawer = () => {
    render();
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeDrawer = () => {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  fab.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

  itemsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    items = items.filter(it => it.uid !== btn.getAttribute('data-remove'));
    persist();
    render();
  });

  clearBtn.addEventListener('click', () => {
    items = [];
    persist();
    render();
  });

  nameInput.addEventListener('input', () => {
    nameInput.classList.remove('is-invalid');
    errorEl.hidden = true;
  });

  /* ── Enviar cotización por WhatsApp ── */
  const buildMessage = (name, zone) => {
    let text = `¡Hola Decoregue! 👋\n\nMi nombre es *${name}*.\n`;
    if (zone) text += `Zona de entrega: *${zone}*.\n`;
    text += `\nQuisiera cotizar:\n`;
    items.forEach((it, i) => {
      text += `\n*${i + 1}. ${it.title}*\n`;
      itemLines(it).forEach(([k, v]) => { text += `• ${k}: ${v}\n`; });
    });
    text += `\n¡Espero su respuesta! 🙌`;
    return text;
  };

  sendBtn.addEventListener('click', () => {
    if (!items.length) return;

    const name = nameInput.value.trim();
    if (!name) {
      nameInput.classList.add('is-invalid');
      errorEl.hidden = false;
      nameInput.focus();
      return;
    }

    const phone = '541141576675';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage(name, zoneInput.value.trim()))}`;
    window.open(url, '_blank');
  });

  /* ── Formulario de cotización (vive dentro del modal del producto) ── */
  const optionsHTML = (list, selected, placeholder) =>
    (placeholder ? `<option value="">${placeholder}</option>` : '') +
    list.map(o => `<option value="${o}"${o === selected ? ' selected' : ''}>${o}</option>`).join('');

  const fmtMeasure = (v) => {
    if (!v) return 'a convenir';
    return /^[\d.,\s]+$/.test(v) ? `${v} m` : v;
  };

  const formatMeasures = (vals, custom) => {
    if (vals.every(v => !v)) return 'A convenir';
    const text = ['Ancho', 'Largo', 'Alto'].map((label, i) => `${label} ${fmtMeasure(vals[i])}`).join(' × ');
    return custom ? `Personalizadas — ${text}` : text;
  };

  const buildForm = (productId, { onBack, onAdded }) => {
    const data = productData[productId];
    const host = document.getElementById('modalQuote');
    if (!data || !host) return;

    const cfg = data.quote || null;

    const configHTML = cfg ? `
      <div class="form-group">
        <label class="form-label" for="qMaterial">Material</label>
        <select id="qMaterial" class="form-control-metal">
          ${optionsHTML(QUOTE_OPTIONS.materiales, cfg.material, cfg.material ? '' : 'Elegir material')}
        </select>
      </div>

      <label class="quote-check">
        <input type="checkbox" id="qInterior"${cfg.interior ? ' checked' : ''} />
        <span class="quote-check-mark" aria-hidden="true"></span>
        <span>Interior de madera</span>
      </label>

      <div class="quote-measures">
        <span class="form-label">Medidas (en metros)</span>

        <div class="quote-row" id="qMeasureSelects">
          <div>
            <label class="quote-mini-label" for="qAncho">Ancho</label>
            <select id="qAncho" class="form-control-metal"></select>
          </div>
          <div>
            <label class="quote-mini-label" for="qLargo">Largo</label>
            <select id="qLargo" class="form-control-metal"></select>
          </div>
          <div>
            <label class="quote-mini-label" for="qAlto">Altura</label>
            <select id="qAlto" class="form-control-metal">
              ${optionsHTML(QUOTE_OPTIONS.alturas, '', 'Elegir')}
            </select>
          </div>
        </div>

        <label class="quote-check">
          <input type="checkbox" id="qCustom" />
          <span class="quote-check-mark" aria-hidden="true"></span>
          <span>Medidas personalizadas</span>
        </label>

        <div class="quote-row" id="qMeasureCustom" hidden>
          <div>
            <label class="quote-mini-label" for="qAnchoC">Ancho</label>
            <input type="text" id="qAnchoC" class="form-control-metal" maxlength="14" placeholder="Ej: 2,50" inputmode="decimal" />
          </div>
          <div>
            <label class="quote-mini-label" for="qLargoC">Largo</label>
            <input type="text" id="qLargoC" class="form-control-metal" maxlength="14" placeholder="Ej: 4,00" inputmode="decimal" />
          </div>
          <div>
            <label class="quote-mini-label" for="qAltoC">Altura</label>
            <input type="text" id="qAltoC" class="form-control-metal" maxlength="14" placeholder="Ej: 2,10" inputmode="decimal" />
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="qPuerta">Tipo de puerta</label>
        <select id="qPuerta" class="form-control-metal">
          ${optionsHTML(QUOTE_OPTIONS.puertas, cfg.puerta || '', cfg.puerta ? '' : 'Elegir tipo de puerta')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="qVentanas">Ventanas (cantidad)</label>
        <input type="number" id="qVentanas" class="form-control-metal" min="0" max="20" step="1" value="0" inputmode="numeric" />
      </div>
    ` : `
      <p class="quote-hint">
        Este producto se cotiza a medida. Contanos medidas, materiales y detalles del espacio en los comentarios.
      </p>
    `;

    host.innerHTML = `
      <button type="button" class="quote-back" id="qBack">
        <i class="fas fa-arrow-left" aria-hidden="true"></i> Volver al producto
      </button>
      <div class="modal-tag">Cotizar</div>
      <h3 class="quote-title">${escapeHTML(data.title)}</h3>
      ${configHTML}
      <div class="form-group">
        <label class="form-label" for="qNotas">Comentarios (opcional)</label>
        <textarea id="qNotas" class="form-control-metal" rows="3" maxlength="400"
                  placeholder="Colores, detalles del espacio, otras consultas..."></textarea>
      </div>
      <button type="button" class="btn-metal btn-metal-solid w-100" id="qAdd" style="justify-content:center;">
        <span>Agregar a mi cotización</span><i class="fas fa-plus" aria-hidden="true"></i>
      </button>
      <p class="quote-add-note">Podés sumar más productos y enviar todo junto en un solo mensaje.</p>
    `;

    const $ = (id) => host.querySelector('#' + id);

    $('qBack').addEventListener('click', onBack);

    /* Lógica del formulario configurable */
    let getConfig = () => ({});

    if (cfg) {
      const materialSel = $('qMaterial');
      const anchoSel = $('qAncho');
      const largoSel = $('qLargo');
      const altoSel = $('qAlto');
      const customChk = $('qCustom');
      const selectsRow = $('qMeasureSelects');
      const customRow = $('qMeasureCustom');

      // Ancho y Largo cambian según el material (Madera usa módulos de 1,30 m)
      const fillWidthLength = () => {
        const list = materialSel.value === 'Madera'
          ? QUOTE_OPTIONS.anchoLargoMadera
          : QUOTE_OPTIONS.anchoLargoChapa;
        [anchoSel, largoSel].forEach(sel => {
          const prev = sel.value;
          sel.innerHTML = optionsHTML(list, list.includes(prev) ? prev : '', 'Elegir');
        });
      };

      fillWidthLength();
      materialSel.addEventListener('change', fillWidthLength);

      customChk.addEventListener('change', () => {
        selectsRow.hidden = customChk.checked;
        customRow.hidden = !customChk.checked;
      });

      getConfig = () => {
        const custom = customChk.checked;
        const vals = custom
          ? [$('qAnchoC').value.trim(), $('qLargoC').value.trim(), $('qAltoC').value.trim()]
          : [anchoSel.value, largoSel.value, altoSel.value];
        return {
          material: materialSel.value,
          interior: $('qInterior').checked,
          medidas: formatMeasures(vals, custom),
          puerta: $('qPuerta').value,
          ventanas: Math.min(20, Math.max(0, parseInt($('qVentanas').value, 10) || 0))
        };
      };
    }

    $('qAdd').addEventListener('click', () => {
      const item = {
        uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        productId,
        title: data.title,
        notas: $('qNotas').value.trim(),
        ...getConfig()
      };
      items.push(item);
      persist();
      render();
      onAdded();
    });
  };

  render();

  return { buildForm, openDrawer, closeDrawer };
};

/* ============================================
   PRODUCT MODAL
   ============================================ */
const initModal = (quote) => {
  const overlay = document.getElementById('productModal');
  const closeBtn = document.getElementById('modalClose');
  const box = overlay.querySelector('.modal-box');
  const detailsView = document.getElementById('modalDetails');
  const quoteView = document.getElementById('modalQuote');
  const quoteBtn = document.getElementById('modalQuoteBtn');
  const wrap = document.getElementById('modalImageWrap');

  let currentId = null;
  let modalCarousel = null; // instancia del carrusel activo dentro del modal

  const destroyModalCarousel = () => {
    if (modalCarousel) {
      modalCarousel.destroy();
      modalCarousel = null;
    }
  };

  const showView = (view) => {
    detailsView.hidden = view !== 'details';
    quoteView.hidden = view !== 'quote';
    box.scrollTop = 0;
  };

  const closeModal = () => {
    destroyModalCarousel(); // frena el autoplay
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  const openModal = (productId, cardEl) => {
    const data = productData[productId];
    if (!data) return;

    currentId = productId;
    showView('details');

    document.getElementById('modalTag').textContent = data.tag;
    document.getElementById('modalTitle').textContent = data.title;

    const measuresEl = document.getElementById('modalMeasures');
    if (data.measures) {
      measuresEl.innerHTML = `<strong>Medidas</strong>${data.measures}`;
      measuresEl.style.display = '';
    } else {
      measuresEl.style.display = 'none';
    }

    document.getElementById('modalDesc').textContent = data.desc;
    document.getElementById('modalMaterials').innerHTML = `<strong>Materiales</strong><p>${data.materials}</p>`;

    // ── Imagen / carrusel del modal ──
    destroyModalCarousel();
    wrap.innerHTML = '';

    const renderPlaceholder = () => {
      wrap.innerHTML = `
        <div style="width:100%;height:100%;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;gap:16px;
                    background:var(--bg-secondary);">
          <i class="fas ${data.icon || 'fa-image'}" style="font-size:3.5rem;color:var(--color-accent-dark);"></i>
          <span style="font-family:var(--font-condensed);font-size:0.75rem;
                       letter-spacing:0.15em;color:var(--color-text-subtle);text-align:center;padding:0 20px;">
            ${data.title}
          </span>
        </div>`;
    };

    const cardCarousel = cardEl && cardEl.querySelector('.card-carousel');
    const modalImgEl = cardEl && cardEl.querySelector('.prod-modal-img');

    if (cardCarousel) {
      // Clonamos el carrusel completo y le activamos la misma lógica (autoplay, flechas, swipe)
      const clone = cardCarousel.cloneNode(true);
      clone.removeAttribute('data-carousel');
      clone.classList.add('modal-carousel');
      wrap.appendChild(clone);
      modalCarousel = setupCarousel(clone);
    } else if (modalImgEl) {
      const clone = modalImgEl.cloneNode(true);
      clone.style.display  = 'block';
      clone.style.width    = '100%';
      clone.style.height   = '100%';
      clone.style.objectFit = 'contain';
      clone.style.objectPosition = 'center';
      clone.style.background = 'var(--bg-secondary)';
      clone.onerror = renderPlaceholder; // si la imagen todavía no existe, muestra el ícono
      wrap.appendChild(clone);
    } else {
      renderPlaceholder();
    }

    const usesContainer = document.getElementById('modalUses');
    usesContainer.innerHTML = data.uses.map(u => `<span class="use-tag">${u}</span>`).join('');

    if (data.colors) {
      document.getElementById('modalColors').innerHTML = `
        <strong style="font-family:var(--font-condensed);font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--color-text-muted);display:block;margin-bottom:8px;">Colores disponibles</strong>
        <p style="font-size:0.85rem;color:var(--color-text);">${data.colors}</p>
      `;
      document.getElementById('modalColors').style.display = '';
    } else {
      document.getElementById('modalColors').style.display = 'none';
    }

    const phone = '541141576675';
    const msg = encodeURIComponent(`¡Hola! Me interesa el producto: *${data.title}*. Quisiera recibir más información y presupuesto. ¡Gracias!`);
    document.getElementById('modalWaBtn').href = `https://wa.me/${phone}?text=${msg}`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  // Botón "Cotizar": abre el formulario dentro del modal
  if (quoteBtn) {
    if (!quote) {
      quoteBtn.style.display = 'none';
    } else {
      quoteBtn.addEventListener('click', () => {
        if (!currentId) return;
        quote.buildForm(currentId, {
          onBack: () => showView('details'),
          onAdded: () => {
            closeModal();
            quote.openDrawer();
          }
        });
        showView('quote');
      });
    }
  }

  // Open modal from cards — avoid triggering when clicking carousel nav
  document.querySelectorAll('[data-product]').forEach(el => {
    el.addEventListener('click', (e) => {
      // Don't open modal if click originated inside carousel nav buttons or dots
      if (e.target.closest('.carousel-nav') || e.target.closest('.carousel-dots')) return;
      openModal(el.getAttribute('data-product'), el);
    });
  });

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
};

/* ============================================
   WHATSAPP FORM
   ============================================ */
const initWhatsappForm = () => {
  const form = document.getElementById('waForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const product = document.getElementById('formProduct').value;
    const zone = document.getElementById('formZone').value.trim();
    const message = document.getElementById('formMessage').value.trim();

    if (!name || !product || !message) {
      alert('Por favor completá todos los campos obligatorios.');
      return;
    }

    const phone = '541141576675';
    let text = `¡Hola Decoregue! 👋\n\n`;
    text += `Mi nombre es *${name}*.\n`;
    text += `Me interesa: *${product}*.\n`;
    if (zone) text += `Zona de entrega: *${zone}*.\n`;
    text += `\n📝 Consulta:\n${message}\n\n`;
    text += `¡Espero su respuesta! 🙌`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  });
};

/* ============================================
   SMOOTH ANCHOR LINKS
   ============================================ */
const initSmoothLinks = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
};

/* ============================================
   PARALLAX (subtle hero)
   ============================================ */
const initParallax = () => {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight * 1.5) {
      heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
    }
  }, { passive: true });
};

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initBackToTop();
  initCounters();
  initCatalogFilter();
  initCardCarousels();
  const quote = initQuote();
  initModal(quote);
  initWhatsappForm();
  initSmoothLinks();
  initParallax();

  console.log('%cDecorEgue 🔩', 'color:#c8922a;font-size:24px;font-weight:bold;font-family:monospace');
  console.log('%cMetalúrgica & Diseño Industrial — Bernal, Buenos Aires', 'color:#888;font-size:12px;font-family:monospace');
});