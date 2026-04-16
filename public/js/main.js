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
   CARD CAROUSELS (OPTIMIZADO)
   ============================================ */
const initCardCarousels = () => {
  const carousels = document.querySelectorAll('.card-carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.card-carousel-track');
    const slides = carousel.querySelectorAll('.card-carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-nav.prev');
    const nextBtn = carousel.querySelector('.carousel-nav.next');
    const counter = carousel.querySelector('.carousel-counter');

    if (!track || slides.length <= 1) return;

    let current = 0;
    const total = slides.length;
    let autoInterval = null;
    let isVisible = false;

    const goTo = (index) => {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });

      if (counter) {
        counter.textContent = `${current + 1} / ${total}`;
      }
    };

    const startAuto = () => {
      if (autoInterval) return;
      autoInterval = setInterval(() => {
        if (isVisible) goTo(current + 1);
      }, 5000);
    };

    const stopAuto = () => {
      clearInterval(autoInterval);
      autoInterval = null;
    };

    // 👇 SOLO corre si está visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startAuto();
        } else {
          stopAuto();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(carousel);

    // botones
    const stopProp = (e) => e.stopPropagation();

    prevBtn?.addEventListener('click', (e) => {
      stopProp(e);
      goTo(current - 1);
    });

    nextBtn?.addEventListener('click', (e) => {
      stopProp(e);
      goTo(current + 1);
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        stopProp(e);
        goTo(i);
      });
    });

    // hover pausa
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', () => {
      if (isVisible) startAuto();
    });

    // swipe
    let touchStartX = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? current + 1 : current - 1);
      }
    }, { passive: true });
  });
};

/* ============================================
   PRODUCT MODAL DATA
   ============================================ */
const productData = {
  'galpon-chapa': {
    tag: 'Galpón de Jardín',
    title: 'Galpon de Jardin de Chapa',
    imgModal: 'assets/galpon-chapa-modal.jpg',
    icon: 'fa-warehouse',
    measures: '2,20 x 1,10 x 1,85 m / 1,10 x 1,10 x 1,85 m',
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
    measures: '2,60 x 1,30 x 1,85 m / 1,30 x 1,30 x 1,85 m',
    desc: 'Fabricación mediante paneles estructurales, unificados mediante tornillo y tuerca. Techo de chapa atornillado a la estructura mediante tornillos perforantes. Puerta con cerrojo con posibilidad para colocar candado.',
    materials: 'Estructura de hierro con pintura E-poxi. Madera estructural machimbre Taeda con dos manos de aceite de lino, que la protege de la intemperie.',
    uses: ['Depósito', 'Espacio de trabajo']
  },
   'quincho-estructural': {
    tag: 'Quincho',
    title: 'Quincho Estructural',
    imgModal: '/images/quinchoestructural.png', // ✅ CORREGIDO
    icon: 'fa-home',
    measures: '4,40 x 2,20 x 200 / A medida',
    desc: 'Quincho estructural con paneles estructurales. Interior en simil madera PVC y exterior en chapa negra/gris o color a elección. La chapa protege el interior de la intemperie dándole un estilo industrial. Modelo personalizable en medidas y materiales.',
    materials: 'Estructura de caño con pintura E-poxi ideal para exteriores. Paneles con cara interna en PVC simil madera y exterior en chapa negra. Piso de chapón reforzado, con posibilidad de integrar rampa.',
    uses: ['Quincho', 'Jardín', 'Espacio social', 'Depósito'],
    colors: 'Chapa negra, Chapa gris, Color a elección'
  }
,
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
   PRODUCT MODAL
   ============================================ */
const initModal = () => {
  const overlay = document.getElementById('productModal');
  const closeBtn = document.getElementById('modalClose');

  const openModal = (productId, cardEl) => {
    const data = productData[productId];
    if (!data) return;

    document.getElementById('modalTag').textContent = data.tag;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalMeasures').innerHTML = `<strong>Medidas</strong>${data.measures}`;
    document.getElementById('modalDesc').textContent = data.desc;
    document.getElementById('modalMaterials').innerHTML = `<strong>Materiales</strong><p>${data.materials}</p>`;

    // Imagen del modal — busca .prod-modal-img dentro de la card
    const wrap = document.getElementById('modalImageWrap');
    wrap.innerHTML = '';

    const modalImgEl = cardEl && cardEl.querySelector('.prod-modal-img');
    if (modalImgEl) {
      const clone = modalImgEl.cloneNode(true);
      clone.style.display  = 'block';
      clone.style.width    = '100%';
      clone.style.height   = '100%';
      clone.style.objectFit = 'cover';
      wrap.appendChild(clone);
    } else {
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

  const closeModal = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

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
    if (e.key === 'Escape') closeModal();
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
  initModal();
  initWhatsappForm();
  initSmoothLinks();
  initParallax();

  console.log('%cDecorEgue 🔩', 'color:#c8922a;font-size:24px;font-weight:bold;font-family:monospace');
  console.log('%cMetalúrgica & Diseño Industrial — Bernal, Buenos Aires', 'color:#888;font-size:12px;font-family:monospace');
});